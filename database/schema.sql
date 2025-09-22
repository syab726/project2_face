-- 내 얼굴 탐구생활 데이터베이스 스키마
-- Created: 2025-08-01
-- Description: 얼굴 관상 분석 서비스를 위한 데이터베이스 스키마

-- 1. 사용자 테이블 (회원가입 없는 서비스이므로 임시 세션 기반)
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    fingerprint VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fingerprint (fingerprint),
    INDEX idx_created_at (created_at)
);

-- 2. 주문 테이블
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36),
    service_type ENUM('mbti-face', 'face', 'face-saju') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_provider VARCHAR(50) DEFAULT 'kg_inicis',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    refund_reason TEXT,
    INDEX idx_session_id (session_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (session_id) REFERENCES user_sessions(id) ON DELETE SET NULL
);

-- 3. 분석 결과 테이블 (임시 저장, 24시간 후 자동 삭제)
CREATE TABLE analysis_results (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36),
    service_type ENUM('mbti-face', 'face', 'face-saju') NOT NULL,
    analysis_data JSON NOT NULL,
    image_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_session_id (session_id),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES user_sessions(id) ON DELETE CASCADE
);

-- 4. 서비스 오류 로그 테이블
CREATE TABLE service_errors (
    id VARCHAR(36) PRIMARY KEY,
    error_type ENUM('payment_error', 'ai_error', 'system_error', 'validation_error', 'network_error') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    order_id VARCHAR(36),
    session_id VARCHAR(36),
    user_email VARCHAR(255),
    stack_trace TEXT,
    metadata JSON,
    status ENUM('new', 'investigating', 'resolved', 'ignored') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    resolved_by VARCHAR(100),
    resolution_notes TEXT,
    INDEX idx_error_type (error_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_order_id (order_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (session_id) REFERENCES user_sessions(id) ON DELETE SET NULL
);

-- 5. 환불 요청 테이블
CREATE TABLE refund_requests (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36),
    user_email VARCHAR(255),
    reason TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'processed') DEFAULT 'pending',
    admin_notes TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by VARCHAR(100),
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_requested_at (requested_at),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES user_sessions(id) ON DELETE SET NULL
);

-- 6. 관리자 세션 테이블
CREATE TABLE admin_sessions (
    id VARCHAR(36) PRIMARY KEY,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at)
);

-- 7. 관리자 액션 로그 테이블
CREATE TABLE admin_actions (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    action_type ENUM('login', 'logout', 'resolve_error', 'process_refund', 'view_dashboard') NOT NULL,
    target_id VARCHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (session_id) REFERENCES admin_sessions(id) ON DELETE CASCADE
);

-- 8. 사용자 분석 통계 테이블 (익명화된 통계)
CREATE TABLE analytics_stats (
    id VARCHAR(36) PRIMARY KEY,
    date_recorded DATE NOT NULL,
    service_type ENUM('mbti-face', 'face', 'face-saju') NOT NULL,
    total_users INT DEFAULT 0,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    successful_analyses INT DEFAULT 0,
    failed_analyses INT DEFAULT 0,
    refund_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date_service (date_recorded, service_type),
    INDEX idx_date_recorded (date_recorded)
);

-- 9. 메뉴 사용 통계 테이블
CREATE TABLE menu_usage_stats (
    id VARCHAR(36) PRIMARY KEY,
    date_recorded DATE NOT NULL,
    menu_type ENUM('mbti-face', 'face', 'face-saju') NOT NULL,
    view_count INT DEFAULT 0,
    click_count INT DEFAULT 0,
    conversion_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date_menu (date_recorded, menu_type),
    INDEX idx_date_recorded (date_recorded)
);

-- 10. 시스템 설정 테이블
CREATE TABLE system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    setting_type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 기본 시스템 설정 데이터 삽입
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('service_enabled', 'true', 'boolean', '서비스 활성화 여부'),
('maintenance_mode', 'false', 'boolean', '유지보수 모드 여부'),
('max_daily_orders', '1000', 'integer', '일일 최대 주문 수'),
('analysis_timeout_seconds', '60', 'integer', 'AI 분석 타임아웃 (초)'),
('auto_cleanup_hours', '24', 'integer', '분석 결과 자동 삭제 시간 (시간)'),
('payment_providers', '["kg_inicis"]', 'json', '지원되는 결제 서비스'),
('pricing', '{"mbti-face": 2900, "face": 4900, "face-saju": 9900}', 'json', '서비스별 가격 (원)');

-- 자동 정리를 위한 이벤트 스케줄러 설정
-- 1. 만료된 분석 결과 자동 삭제 (매시간)
SET GLOBAL event_scheduler = ON;

DELIMITER $$
CREATE EVENT IF NOT EXISTS cleanup_expired_analysis
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    DELETE FROM analysis_results WHERE expires_at < NOW();
END$$

-- 2. 오래된 사용자 세션 정리 (매일 자정)
CREATE EVENT IF NOT EXISTS cleanup_old_sessions
ON SCHEDULE EVERY 1 DAY
STARTS CURDATE() + INTERVAL 1 DAY
DO
BEGIN
    DELETE FROM user_sessions WHERE last_activity < DATE_SUB(NOW(), INTERVAL 30 DAY);
END$$

-- 3. 오래된 서비스 오류 로그 정리 (매주)
CREATE EVENT IF NOT EXISTS cleanup_old_error_logs
ON SCHEDULE EVERY 1 WEEK
STARTS CURDATE() + INTERVAL 1 DAY
DO
BEGIN
    DELETE FROM service_errors WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY) AND status IN ('resolved', 'ignored');
END$$

DELIMITER ;

-- 인덱스 최적화를 위한 추가 복합 인덱스
ALTER TABLE orders ADD INDEX idx_status_created (payment_status, created_at);
ALTER TABLE service_errors ADD INDEX idx_type_status_created (error_type, status, created_at);
ALTER TABLE analytics_stats ADD INDEX idx_date_service (date_recorded, service_type);

-- 성능 모니터링을 위한 뷰 생성
CREATE VIEW daily_order_summary AS
SELECT 
    DATE(created_at) as order_date,
    service_type,
    COUNT(*) as total_orders,
    SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as revenue,
    COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as successful_orders,
    COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_orders,
    COUNT(CASE WHEN payment_status = 'refunded' THEN 1 END) as refunded_orders
FROM orders 
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(created_at), service_type
ORDER BY order_date DESC, service_type;

CREATE VIEW error_summary AS
SELECT 
    DATE(created_at) as error_date,
    error_type,
    status,
    COUNT(*) as error_count
FROM service_errors 
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY DATE(created_at), error_type, status
ORDER BY error_date DESC, error_type;