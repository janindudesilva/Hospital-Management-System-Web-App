package com.hospital.config;

import com.hospital.model.User;
import com.hospital.model.enums.Role;
import com.hospital.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DataSeeder(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE doctors DROP COLUMN department");
            System.out.println("Dropped obsolete 'department' column from 'doctors' table.");
        } catch (Exception e) {
            // Ignored, column already dropped or does not exist
        }
        seedAdmin();
    }


    private void seedAdmin() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setEnabled(true);
            admin.setEmail("admin@hospital.com");
            admin.setPhone("1234567890");
            userRepository.save(admin);
            System.out.println("Default Admin seeded successfully.");
        }
    }

}
