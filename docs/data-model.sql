-- ============================================================================
-- Sunic AI Employee - 三工光电人事AI员工系统
-- PostgreSQL 建表语句 (可直接执行)
-- 版本: 1.0.0 | 日期: 2026-04-22
-- ============================================================================

-- 启用扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";  -- pgvector 用于 AI 向量检索

-- ============================================================================
-- 基础表
-- ============================================================================

-- 部门表（树形结构，最多 6 级）
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL COMMENT '部门名称',
    parent_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
    level SMALLINT NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 6),
    sort_order INT NOT NULL DEFAULT 0,
    head_employee_id UUID,  -- 延迟外键，建表后添加
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID,
    updated_by UUID
);
COMMENT ON TABLE departments IS '部门表（支持6级树形结构）';
COMMENT ON COLUMN departments.name IS '部门名称';
COMMENT ON COLUMN departments.parent_id IS '父部门ID，NULL为顶级';
COMMENT ON COLUMN departments.level IS '层级（1-6）';
COMMENT ON COLUMN departments.head_employee_id IS '部门负责人';
CREATE INDEX idx_departments_parent ON departments(parent_id);

-- 岗位表
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    department_id UUID REFERENCES departments(id),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE positions IS '岗位表';
COMMENT ON COLUMN positions.name IS '岗位名称';

-- 角色表
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE CHECK (code IN ('candidate','employee','manager','hr','interviewer','admin')),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE roles IS '系统角色表';
COMMENT ON COLUMN roles.code IS '角色代码：candidate/employee/manager/hr/interviewer/admin';
INSERT INTO roles (code, name, description) VALUES
    ('candidate', '候选人', '只能查看自己的投递信息'),
    ('employee', '普通员工', '只能访问自己的数据和AI助手'),
    ('manager', '部门主管', '自己+直属下属数据'),
    ('hr', 'HR人员', '全公司员工数据+招聘+配置'),
    ('interviewer', '面试官', '自己参与的面试和候选人'),
    ('admin', '系统管理员', '所有权限');

-- 权限表
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    module VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE permissions IS '权限表';

-- 角色-权限关联
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================================================
-- 员工模块
-- ============================================================================

-- 员工主表
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_no VARCHAR(20) NOT NULL UNIQUE,                    -- 工号如 E001
    name VARCHAR(50) NOT NULL,                                  -- 姓名
    gender VARCHAR(10) CHECK (gender IN ('男','女')),
    birth DATE,                                                 -- 出生日期
    phone VARCHAR(20),                                          -- 手机号 -- SENSITIVE: 日志脱敏
    email VARCHAR(100),
    id_number BYTEA,                                            -- 身份证号（AES-256加密存储）-- SENSITIVE: 日志脱敏
    id_start DATE,                                              -- 身份证签发日
    id_end DATE,                                                -- 身份证到期日
    avatar_url TEXT,
    department_id UUID REFERENCES departments(id),
    position_id UUID REFERENCES positions(id),
    position_name VARCHAR(100),                                 -- 冗余字段，便于列表查询
    entity VARCHAR(100) NOT NULL CHECK (entity IN (
        '武汉三工光电设备制造有限公司',
        '三工光电(鄂州)有限公司',
        '三工国际贸易有限公司',
        '三工激光科技有限公司',
        '三工新能源科技有限公司',
        '三工新能源(鄂州)有限公司',
        '其他'
    )),                                                         -- 合同归属实体
    hire_date DATE NOT NULL,                                    -- 入职日期
    contract_start DATE,                                        -- 合同开始
    contract_end DATE,                                          -- 合同结束
    direct_manager_id UUID REFERENCES employees(id),            -- 直属上级
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
        'active','on_leave','probation','resigned','suspended'
    )),
    education VARCHAR(50),                                      -- 学历
    school VARCHAR(100),                                        -- 毕业院校
    major VARCHAR(100),                                         -- 专业
    completeness SMALLINT DEFAULT 0 CHECK (completeness BETWEEN 0 AND 100),
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN (
        'synced','pending','diff','failed'
    )),
    last_sync_at TIMESTAMPTZ,
    last_change VARCHAR(200),                                   -- 最近异动
    dingtalk_user_id VARCHAR(100),                              -- 钉钉用户ID
    deleted_at TIMESTAMPTZ,                                     -- 软删除
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID,
    updated_by UUID
);
COMMENT ON TABLE employees IS '员工主表';
COMMENT ON COLUMN employees.employee_no IS '工号，如E001';
COMMENT ON COLUMN employees.id_number IS '身份证号（AES-256-GCM加密存储）';
COMMENT ON COLUMN employees.entity IS '合同归属实体（6选1+其他）';
COMMENT ON COLUMN employees.status IS '状态：active在职/on_leave休假/probation试用/resigned离职/suspended停薪留职';
COMMENT ON COLUMN employees.sync_status IS '钉钉同步状态';
COMMENT ON COLUMN employees.completeness IS '资料完整度(0-100)';
CREATE INDEX idx_employees_dept ON employees(department_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_manager ON employees(direct_manager_id);
CREATE INDEX idx_employees_entity ON employees(entity);
CREATE INDEX idx_employees_deleted ON employees(deleted_at) WHERE deleted_at IS NULL;

-- 延迟外键：部门负责人
ALTER TABLE departments ADD CONSTRAINT fk_dept_head
    FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

-- 用户账号表（登录认证）
CREATE TABLE user_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE user_accounts IS '用户登录账号表';

-- 用户-角色关联
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE (user_id, role_id)
);
COMMENT ON TABLE user_roles IS '用户角色关联表';

-- 员工档案扩展
CREATE TABLE employee_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    emergency_contact_name VARCHAR(50),
    emergency_contact_phone VARCHAR(20),                        -- SENSITIVE: 日志脱敏
    emergency_contact_relation VARCHAR(20),
    bank_account BYTEA,                                         -- 银行卡号（加密）-- SENSITIVE: 日志脱敏
    bank_name VARCHAR(100),
    work_experiences JSONB DEFAULT '[]',                         -- [{company,position,start,end,description}]
    education_history JSONB DEFAULT '[]',                        -- [{school,degree,major,start,end}]
    certifications JSONB DEFAULT '[]',                           -- [{name,issuer,date,expiry}]
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE employee_profiles IS '员工档案扩展（紧急联系人、银行卡、工作经历等）';
COMMENT ON COLUMN employee_profiles.bank_account IS '银行卡号（AES-256-GCM加密存储）';

-- 钉钉差异记录
CREATE TABLE employee_diffs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    field VARCHAR(50) NOT NULL,
    dingtalk_value TEXT,
    system_value TEXT,
    resolved_at TIMESTAMPTZ,
    action VARCHAR(20) CHECK (action IN ('accept_dingtalk','keep_system')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE employee_diffs IS '钉钉数据差异记录';
CREATE INDEX idx_diffs_employee ON employee_diffs(employee_id);
CREATE INDEX idx_diffs_unresolved ON employee_diffs(resolved_at) WHERE resolved_at IS NULL;

-- 员工材料
CREATE TABLE employee_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('contract','id_card','diploma','cert')),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,                                     -- 对象存储路径
    file_size BIGINT,
    ocr_result JSONB,                                            -- OCR识别结果
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    uploaded_by UUID
);
COMMENT ON TABLE employee_materials IS '员工档案材料（合同/身份证/学历/资质）';
CREATE INDEX idx_materials_employee ON employee_materials(employee_id);

-- 异动记录
CREATE TABLE change_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,                                   -- 入职/转正/调岗/续签/部门变动
    detail TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID
);
COMMENT ON TABLE change_records IS '员工异动记录';
CREATE INDEX idx_changes_employee ON change_records(employee_id);
CREATE INDEX idx_changes_date ON change_records(date);

-- ============================================================================
-- 考勤模块
-- ============================================================================

-- 法定假日表
CREATE TABLE holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('holiday','workday')),  -- 假日/调休工作日
    year SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE holidays IS '法定假日表';
CREATE INDEX idx_holidays_date ON holidays(date);
CREATE INDEX idx_holidays_year ON holidays(year);

-- 排班表
CREATE TABLE shift_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,                                  -- 班次名称
    group_name VARCHAR(100) NOT NULL,                            -- 考勤组
    work_start TIME NOT NULL,                                    -- 上班时间
    work_end TIME NOT NULL,                                      -- 下班时间
    late_threshold_minutes SMALLINT DEFAULT 0,                   -- 迟到容忍分钟
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE shift_schedules IS '排班/班次定义';

-- 打卡记录
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    date DATE NOT NULL,
    shift_id UUID REFERENCES shift_schedules(id),
    clock_in TIMESTAMPTZ,
    clock_out TIMESTAMPTZ,
    clock_in_source VARCHAR(20),                                 -- dingtalk/gate/manual
    clock_out_source VARCHAR(20),
    work_hours NUMERIC(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE attendance_records IS '每日打卡记录';
CREATE UNIQUE INDEX idx_attendance_emp_date ON attendance_records(employee_id, date);
CREATE INDEX idx_attendance_date ON attendance_records(date);

-- 考勤异常
CREATE TABLE attendance_exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    date DATE NOT NULL,
    group_name VARCHAR(100),                                     -- 考勤组
    clock_in VARCHAR(20),                                        -- 实际上班打卡时间
    clock_out VARCHAR(20),                                       -- 实际下班打卡时间
    type VARCHAR(20) NOT NULL CHECK (type IN (
        'late','early_leave','absent','missing_clock','overtime'
    )),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending','waiting_employee','approving','done'
    )),
    ai_suggestion TEXT,                                          -- AI处理建议
    ai_confidence NUMERIC(3,2),                                  -- AI置信度
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES employees(id),
    resolve_action VARCHAR(20),                                  -- make_up/write_off/contact/escalate
    resolve_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE attendance_exceptions IS '考勤异常记录';
COMMENT ON COLUMN attendance_exceptions.type IS '异常类型：late迟到/early_leave早退/absent缺勤/missing_clock漏打卡/overtime加班未报备';
COMMENT ON COLUMN attendance_exceptions.status IS '状态流：pending→waiting_employee→approving→done';
CREATE INDEX idx_exceptions_employee ON attendance_exceptions(employee_id);
CREATE INDEX idx_exceptions_date ON attendance_exceptions(date);
CREATE INDEX idx_exceptions_status ON attendance_exceptions(status);

-- 加班记录
CREATE TABLE overtime_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    date DATE NOT NULL,
    group_name VARCHAR(100),
    clock_in VARCHAR(20),
    clock_out VARCHAR(20),
    work_hours NUMERIC(5,2),
    dept_type VARCHAR(20) NOT NULL CHECK (dept_type IN ('functional','production')),
    subsidy_type VARCHAR(20) CHECK (subsidy_type IN ('meal','time_off','cash')),
    subsidy_value VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending','approved','rejected'
    )),
    remark TEXT,
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE overtime_records IS '加班记录';
COMMENT ON COLUMN overtime_records.dept_type IS '部门类型：functional职能部门/production生产一线';
COMMENT ON COLUMN overtime_records.subsidy_type IS '补贴方式：meal餐补/time_off调休/cash金额';
CREATE INDEX idx_overtime_employee ON overtime_records(employee_id);
CREATE INDEX idx_overtime_date ON overtime_records(date);
CREATE INDEX idx_overtime_status ON overtime_records(status);

-- ============================================================================
-- 绩效模块
-- ============================================================================

-- 考核周期
CREATE TABLE performance_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('quarterly','semi_annual','annual')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    scope TEXT,                                                  -- 覆盖范围描述
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')),
    stages JSONB NOT NULL DEFAULT '[]',                          -- 5阶段状态JSON
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID
);
COMMENT ON TABLE performance_cycles IS '考核周期';
COMMENT ON COLUMN performance_cycles.type IS '类型：quarterly季度/semi_annual半年/annual年度';
COMMENT ON COLUMN performance_cycles.stages IS '5阶段进度JSON: [{name,label,status,deadline,completed_count,total_count}]';

-- 绩效表单
CREATE TABLE performance_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id UUID NOT NULL REFERENCES performance_cycles(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    kpis JSONB NOT NULL DEFAULT '[]',                            -- KPI评分列表
    self_total NUMERIC(5,2),
    leader_total NUMERIC(5,2),
    comment TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN (
        'submitted','pending_leader','pending_dept','overdue','ai_anomaly'
    )),
    anomaly TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE performance_forms IS '绩效表单';
COMMENT ON COLUMN performance_forms.kpis IS 'KPI评分JSON: [{code,name,weight,target,achievement,source,selfScore,leaderScore,aiSuggested}]';
CREATE UNIQUE INDEX idx_perf_form_cycle_emp ON performance_forms(cycle_id, employee_id);
CREATE INDEX idx_perf_form_status ON performance_forms(status);

-- KPI指标库
CREATE TABLE kpi_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,                            -- 如 MF-021
    name VARCHAR(200) NOT NULL,
    family VARCHAR(100) NOT NULL,                                -- 所属部门
    unit VARCHAR(50),
    target VARCHAR(200),
    source VARCHAR(200),                                         -- 数据源
    ai_tag VARCHAR(50),                                          -- AI标签：AI推荐/新增/行业基准N%
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE kpi_metrics IS 'KPI指标库';
CREATE INDEX idx_kpi_family ON kpi_metrics(family);

-- 公司战略目标
CREATE TABLE company_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    period VARCHAR(50),
    items JSONB NOT NULL DEFAULT '[]',                            -- [{kpi,target,weight}]
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE company_strategies IS '公司战略目标';

-- 部门战略目标
CREATE TABLE dept_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_strategy_id UUID REFERENCES company_strategies(id),
    dept_name VARCHAR(100) NOT NULL,
    head VARCHAR(50),
    kpis JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE dept_strategies IS '部门战略目标';

-- 绩效面谈记录
CREATE TABLE performance_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    cycle_id UUID NOT NULL REFERENCES performance_cycles(id),
    score NUMERIC(5,2),
    level VARCHAR(5) CHECK (level IN ('A','B+','B','B-','C','D')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed')),
    talking_points JSONB,                                        -- AI生成5步话术
    next_quarter_goals JSONB,                                    -- AI推荐改进目标
    result_application JSONB,                                    -- {coefficient,salaryBand,talentAction,trainingAdvice}
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE performance_interviews IS '绩效面谈记录';
COMMENT ON COLUMN performance_interviews.level IS '绩效等级：A≥90/B+85-89/B80-84/B-70-79/C60-69/D<60';
CREATE INDEX idx_perf_interview_emp ON performance_interviews(employee_id);

-- 过程数据源
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,                            -- MES/ERP/PLM/CRM/QMS
    status VARCHAR(20) NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected','disconnected')),
    endpoint_url TEXT,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE data_sources IS '绩效过程数据源（MES/ERP/PLM/CRM/QMS）';
INSERT INTO data_sources (name, status) VALUES
    ('MES', 'disconnected'),
    ('ERP', 'disconnected'),
    ('PLM', 'disconnected'),
    ('CRM', 'disconnected'),
    ('QMS', 'disconnected');

-- ============================================================================
-- 招聘模块
-- ============================================================================

-- 岗位需求
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    dept VARCHAR(100),
    location VARCHAR(100),
    headcount SMALLINT NOT NULL DEFAULT 1,
    salary VARCHAR(100),
    urgency VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (urgency IN ('high','medium','low')),
    status VARCHAR(20) NOT NULL DEFAULT 'recruiting' CHECK (status IN (
        'recruiting','profile_pending','paused','completed'
    )),
    owner VARCHAR(50),                                           -- 招聘负责人
    jd TEXT,                                                     -- 岗位描述
    has_profile BOOLEAN NOT NULL DEFAULT false,
    resume_count INT DEFAULT 0,
    matched_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID
);
COMMENT ON TABLE job_postings IS '岗位需求（JD）';
COMMENT ON COLUMN job_postings.urgency IS '紧急程度：high 2周内/medium 1月内/low 无节点';
CREATE INDEX idx_jobs_status ON job_postings(status);
CREATE INDEX idx_jobs_dept ON job_postings(dept);

-- 岗位画像
CREATE TABLE job_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL UNIQUE REFERENCES job_postings(id) ON DELETE CASCADE,
    dimensions JSONB NOT NULL DEFAULT '[]',                      -- [{key,label,weight,items[]}]
    generated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE job_profiles IS 'AI生成的岗位画像';

-- 候选人
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),                                           -- SENSITIVE: 日志脱敏
    email VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'resume_screening' CHECK (status IN (
        'resume_screening','phone_interview','onsite_interview','final_interview',
        'offer_pending','offer_sent','hired','rejected','withdrawn'
    )),
    data_expiry_at TIMESTAMPTZ,                                  -- 个人信息保留到期时间（2年）
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE candidates IS '候选人';
COMMENT ON COLUMN candidates.status IS '招聘阶段状态';
COMMENT ON COLUMN candidates.data_expiry_at IS '个人信息保留期限（默认创建后2年），到期后自动清理';
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_expiry ON candidates(data_expiry_at);

-- 简历
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,                                     -- 对象存储路径
    file_name VARCHAR(255),
    parse_status VARCHAR(20) NOT NULL DEFAULT 'parsing' CHECK (parse_status IN (
        'parsed','parsing','failed'
    )),
    parsed_data JSONB,                                           -- 解析后结构化数据
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    uploaded_by UUID
);
COMMENT ON TABLE resumes IS '简历';
CREATE INDEX idx_resumes_candidate ON resumes(candidate_id);
CREATE INDEX idx_resumes_parse ON resumes(parse_status);

-- 候选人-岗位匹配记录
CREATE TABLE candidate_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id),
    rank SMALLINT,
    match_score NUMERIC(5,2),                                    -- 匹配度
    dim_scores JSONB DEFAULT '[]',                               -- 各维度评分
    ai_comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (job_id, candidate_id)
);
COMMENT ON TABLE candidate_matches IS '候选人与岗位匹配记录（AI生成）';
CREATE INDEX idx_matches_job ON candidate_matches(job_id);

-- 面试安排
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    job_id UUID NOT NULL REFERENCES job_postings(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes SMALLINT DEFAULT 60,
    location VARCHAR(200),
    type VARCHAR(20) NOT NULL DEFAULT 'onsite' CHECK (type IN ('phone','onsite','video')),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled','completed','cancelled'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID
);
COMMENT ON TABLE interviews IS '面试安排';
CREATE INDEX idx_interviews_candidate ON interviews(candidate_id);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_at);

-- 面试官关联
CREATE TABLE interview_interviewers (
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    PRIMARY KEY (interview_id, employee_id)
);
COMMENT ON TABLE interview_interviewers IS '面试-面试官关联';

-- 面试反馈
CREATE TABLE interview_feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    interviewer_id UUID NOT NULL REFERENCES employees(id),
    overall_score NUMERIC(4,2),
    dimensions JSONB DEFAULT '[]',                               -- [{name,score,comment}]
    recommendation VARCHAR(20) CHECK (recommendation IN ('pass','fail','pending')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (interview_id, interviewer_id)
);
COMMENT ON TABLE interview_feedbacks IS '面试反馈评价';

-- Offer记录
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    job_id UUID NOT NULL REFERENCES job_postings(id),
    salary_offered VARCHAR(100),
    start_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending','accepted','rejected','withdrawn'
    )),
    sent_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE offers IS 'Offer记录';

-- ============================================================================
-- 培训模块
-- ============================================================================

-- 考试/试卷
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100),                                       -- 培训领域
    dept VARCHAR(100),
    question_count SMALLINT NOT NULL DEFAULT 0,
    duration SMALLINT,                                           -- 时长(分钟)
    difficulty VARCHAR(10) CHECK (difficulty IN ('easy','mid','hard')),
    pass_line NUMERIC(5,2),
    sites TEXT[],                                                -- 适用厂区
    status VARCHAR(20) DEFAULT '批改中',
    avg_score NUMERIC(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID
);
COMMENT ON TABLE exams IS '考试试卷';
CREATE INDEX idx_exams_category ON exams(category);

-- 题目
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    type VARCHAR(10) NOT NULL CHECK (type IN ('single','multi','judge','essay')),
    difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('easy','mid','hard')),
    stem TEXT NOT NULL,
    knowledge_point VARCHAR(200),
    answer TEXT,
    options JSONB,                                               -- 选择题选项 [{label,text,isCorrect}]
    uses INT DEFAULT 0,
    avg_score NUMERIC(5,2),
    quality NUMERIC(3,2),
    low_quality BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE questions IS '题库题目';
CREATE INDEX idx_questions_category ON questions(category, sub_category);
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_quality ON questions(low_quality) WHERE low_quality = true;

-- 试卷-题目关联
CREATE TABLE exam_questions (
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id),
    sort_order SMALLINT DEFAULT 0,
    score NUMERIC(5,2),                                          -- 该题分值
    PRIMARY KEY (exam_id, question_id)
);
COMMENT ON TABLE exam_questions IS '试卷-题目关联';

-- 批改记录
CREATE TABLE grading_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id),
    employee_id UUID NOT NULL REFERENCES employees(id),
    question_id UUID NOT NULL REFERENCES questions(id),
    ai_score NUMERIC(5,2),
    hr_score NUMERIC(5,2),
    ai_comment TEXT,
    hr_comment TEXT,
    flagged BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE grading_items IS 'AI初评+HR复核批改记录';
CREATE INDEX idx_grading_exam ON grading_items(exam_id);
CREATE INDEX idx_grading_flagged ON grading_items(flagged) WHERE flagged = true;

-- 培训材料
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    file_path TEXT NOT NULL,
    file_type VARCHAR(10) CHECK (file_type IN ('PDF','Word','PPT')),
    page_count SMALLINT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    uploaded_by UUID
);
COMMENT ON TABLE materials IS '培训材料';
CREATE INDEX idx_materials_category ON materials(category);

-- 导师
CREATE TABLE mentors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL UNIQUE REFERENCES employees(id),
    level VARCHAR(20) NOT NULL DEFAULT 'certified' CHECK (level IN ('gold','senior','certified')),
    site VARCHAR(100),
    years SMALLINT DEFAULT 0,
    active SMALLINT DEFAULT 0,                                   -- 当前在带
    capacity SMALLINT DEFAULT 3,                                 -- 最大容量
    graduated SMALLINT DEFAULT 0,                                -- 已出师
    rating NUMERIC(3,2),
    pass_rate NUMERIC(5,2),
    crafts TEXT[] DEFAULT '{}',                                  -- 擅长领域
    tags TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available','full','rest')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE mentors IS '导师';
COMMENT ON COLUMN mentors.level IS '等级：gold金牌/senior资深/certified认证';
COMMENT ON COLUMN mentors.status IS '状态：available/full(active==capacity)/rest';
CREATE INDEX idx_mentors_level ON mentors(level);
CREATE INDEX idx_mentors_status ON mentors(status);

-- 在岗培训计划
CREATE TABLE onsite_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    mentor_id UUID NOT NULL REFERENCES mentors(id),
    start_date DATE NOT NULL,
    checkpoints JSONB NOT NULL DEFAULT '[]',                     -- [{week,title,status,content,completedAt}]
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE onsite_plans IS '在岗培训计划（W1-W8节点）';
CREATE INDEX idx_onsite_employee ON onsite_plans(employee_id);
CREATE INDEX idx_onsite_mentor ON onsite_plans(mentor_id);

-- ============================================================================
-- AI 模块
-- ============================================================================

-- AI Agent 配置
CREATE TABLE ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,                            -- hr_assistant/resume_screener/...
    name VARCHAR(100) NOT NULL,
    description TEXT,
    system_prompt TEXT NOT NULL,                                  -- 系统 Prompt 模板
    model VARCHAR(100) NOT NULL DEFAULT 'gpt-4',
    temperature NUMERIC(3,2) DEFAULT 0.7,
    max_tokens INT DEFAULT 4096,
    tools JSONB DEFAULT '[]',                                    -- 可用工具定义
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE ai_agents IS 'AI Agent配置（含系统Prompt）';
INSERT INTO ai_agents (code, name, system_prompt) VALUES
    ('hr_assistant', '员工HR助手', '你是三工光电的HR智能助手...'),
    ('resume_screener', '简历筛选官', '你是专业的简历筛选AI...'),
    ('interview_helper', '面试助手', '你是面试辅助AI...'),
    ('performance_coach', '绩效辅导官', '你是绩效管理AI顾问...'),
    ('knowledge_qa', '知识问答', '你是三工光电的知识库问答AI...'),
    ('data_insight', '数据洞察官', '你是HR数据分析AI...');

-- AI 会话
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_accounts(id),
    agent_code VARCHAR(50) NOT NULL,
    scene VARCHAR(50),
    title VARCHAR(200),
    pinned BOOLEAN DEFAULT false,
    archived_at TIMESTAMPTZ,                                     -- 90天后归档
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE ai_conversations IS 'AI对话会话（保留90天后归档）';
CREATE INDEX idx_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_conversations_archive ON ai_conversations(archived_at);

-- AI 消息
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user','assistant','system')),
    content TEXT NOT NULL,
    thinking TEXT,                                               -- AI思考过程
    sources JSONB,                                               -- 引用来源
    card JSONB,                                                  -- 结构化卡片
    followups TEXT[],                                            -- 追问建议
    token_prompt INT,                                            -- Prompt token 消耗
    token_completion INT,                                        -- Completion token 消耗
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE ai_messages IS 'AI对话消息（含token消耗审计）';
CREATE INDEX idx_messages_conversation ON ai_messages(conversation_id);

-- 知识库
CREATE TABLE ai_knowledge_bases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    document_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE ai_knowledge_bases IS 'AI知识库';

-- 知识库文档
CREATE TABLE ai_knowledge_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    knowledge_base_id UUID NOT NULL REFERENCES ai_knowledge_bases(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    file_path TEXT,
    chunk_count INT DEFAULT 0,
    embedding_status VARCHAR(20) DEFAULT 'pending' CHECK (embedding_status IN (
        'pending','processing','completed','failed'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE ai_knowledge_documents IS '知识库文档';
CREATE INDEX idx_knowledge_docs_base ON ai_knowledge_documents(knowledge_base_id);

-- 知识库向量块
CREATE TABLE ai_knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES ai_knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),                                      -- OpenAI text-embedding-ada-002
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE ai_knowledge_chunks IS '知识库文档向量块（pgvector）';
CREATE INDEX idx_chunks_document ON ai_knowledge_chunks(document_id);
CREATE INDEX idx_chunks_embedding ON ai_knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- AI 自动化任务定义
CREATE TABLE ai_automation_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(20) CHECK (trigger_type IN ('schedule','event','manual')),
    trigger_config JSONB,                                        -- cron/事件配置
    agent_code VARCHAR(50),
    prompt_template TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE ai_automation_tasks IS 'AI自动化任务定义';

-- AI 任务执行记录
CREATE TABLE ai_task_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES ai_automation_tasks(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('running','completed','failed')),
    input JSONB,
    output JSONB,
    token_used INT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    error_message TEXT
);
COMMENT ON TABLE ai_task_executions IS 'AI任务执行记录';
CREATE INDEX idx_task_exec_task ON ai_task_executions(task_id);
CREATE INDEX idx_task_exec_status ON ai_task_executions(status);

-- ============================================================================
-- 系统表
-- ============================================================================

-- 审计日志
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,                                -- 操作类型
    module VARCHAR(50) NOT NULL,                                 -- 所属模块
    target_type VARCHAR(50),                                     -- 目标实体类型
    target_id UUID,                                              -- 目标实体ID
    detail JSONB,                                                -- 操作详情（敏感字段脱敏）
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE audit_logs IS '操作审计日志（敏感操作必记）';
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_module ON audit_logs(module);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- 通知
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,                                   -- 通知类型
    title VARCHAR(200) NOT NULL,
    content TEXT,
    channel VARCHAR(20) CHECK (channel IN ('dingtalk','sms','system')),
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE notifications IS '系统通知';
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ============================================================================
-- 数据关系说明
-- ============================================================================
/*
核心关系：
1. 部门树：departments.parent_id → departments.id（自关联，最多6级）
2. 员工-部门：employees.department_id → departments.id
3. 员工-上级：employees.direct_manager_id → employees.id（同部门或上级部门）
4. 用户-角色：user_accounts → user_roles → roles（多对多）
5. 招聘流程：job_postings → job_profiles（1:1画像）
              job_postings → candidate_matches ← candidates（多对多匹配）
              candidates → resumes（1:N简历）
              interviews → interview_interviewers（N:M面试官）
              interviews → interview_feedbacks（1:N反馈）
6. 绩效流程：performance_cycles → performance_forms → employees
              performance_cycles → performance_interviews → employees
              kpi_metrics 为独立指标库
7. 培训体系：exams → exam_questions → questions
              mentors → onsite_plans ← employees
              grading_items 关联 exam + employee + question
8. AI模块：ai_agents 配置 → ai_conversations → ai_messages
           ai_knowledge_bases → ai_knowledge_documents → ai_knowledge_chunks（向量）

数据保留策略：
- 离职员工数据：保留2年（employees.deleted_at + 2年后可清理）
- 候选人信息：candidates.data_expiry_at（创建后2年）
- AI对话：ai_conversations.archived_at（90天后归档）
- 审计日志：永久保留

敏感数据：
- employees.id_number：AES-256-GCM加密存储，bytea类型
- employee_profiles.bank_account：AES-256-GCM加密存储，bytea类型
- employees.phone / candidates.phone：日志中脱敏输出
*/
