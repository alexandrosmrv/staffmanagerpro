-- Δημιουργία πίνακα προσωπικού
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    is_active BOOLEAN DEFAULT FALSE
);

-- Δημιουργία πίνακα διαλειμμάτων
CREATE TABLE IF NOT EXISTS breaks (
    id UUID PRIMARY KEY,
    staff_name VARCHAR(255) NOT NULL,
    supervisor_name VARCHAR(255),
    date DATE NOT NULL,
    shift VARCHAR(50),
    schedule VARCHAR(50),
    break30_1_from VARCHAR(5),
    break30_1_to VARCHAR(5),
    break30_2_from VARCHAR(5),
    break30_2_to VARCHAR(5),
    break10_1_from VARCHAR(5),
    break10_1_to VARCHAR(5),
    break10_2_from VARCHAR(5),
    break10_2_to VARCHAR(5),
    created_at BIGINT NOT NULL
);