package com.hospital.service.impl;

import com.hospital.dto.request.LoginRequest;
import com.hospital.dto.request.RegisterRequest;
import com.hospital.dto.response.JwtResponse;
import com.hospital.model.Patient;
import com.hospital.model.User;
import com.hospital.model.enums.Role;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.DepartmentRepository;
import com.hospital.model.Doctor;
import com.hospital.security.JwtUtils;
import com.hospital.security.UserDetailsImpl;
import com.hospital.service.AuthService;
import com.hospital.service.DoctorService;
import com.hospital.service.PatientService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String jwt = jwtUtils.generateJwtToken(authentication);

        return new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getRole(),
                userDetails.getPhone(),
                userDetails.getAddress(),
                userDetails.getDateOfBirth()
        );
    }

    @Override
    @Transactional
    public JwtResponse registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        // Security check: Only allow ROLE_PATIENT and ROLE_DOCTOR for public registration
        Role role = registerRequest.getRole();
        if (role == null || (role != Role.ROLE_PATIENT && role != Role.ROLE_DOCTOR)) {
            role = Role.ROLE_PATIENT;
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEmail(registerRequest.getEmail());
        user.setPhone(registerRequest.getPhone());
        user.setRole(role);
        // All accounts are auto-enabled via registration
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        if (role == Role.ROLE_PATIENT) {
            Patient patient = new Patient();
            patient.setUser(savedUser);
            patient.setFullName(registerRequest.getFullName());
            patient.setAge(registerRequest.getAge());
            patient.setGender(registerRequest.getGender());
            patient.setPhone(registerRequest.getPhone());
            patient.setAddress(registerRequest.getAddress());
            patient.setDateOfBirth(registerRequest.getDateOfBirth());

            patientRepository.save(patient);

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            registerRequest.getUsername(),
                            registerRequest.getPassword()
                    )
            );

            String jwt = jwtUtils.generateJwtToken(authentication);

            return new JwtResponse(
                    jwt,
                    savedUser.getId(),
                    savedUser.getUsername(),
                    savedUser.getEmail(),
                    savedUser.getRole(),
                    registerRequest.getPhone(),
                    registerRequest.getAddress(),
                    registerRequest.getDateOfBirth() != null ? registerRequest.getDateOfBirth().toString() : null
            );
        } else {
            Doctor doctor = new Doctor();
            doctor.setUser(savedUser);
            doctor.setFullName(registerRequest.getFullName());
            doctor.setEmail(registerRequest.getEmail());
            doctor.setPhone(registerRequest.getPhone());
            doctor.setSpecialization(registerRequest.getSpecialization());
            doctor.setQualification(registerRequest.getQualification());
            doctor.setExperience(registerRequest.getExperience());
            doctor.setConsultationFee(registerRequest.getConsultationFee());

            if (registerRequest.getDepartmentId() != null) {
                com.hospital.model.Department department = departmentRepository.findById(registerRequest.getDepartmentId())
                        .orElseThrow(() -> new RuntimeException("Department not found"));
                doctor.setDepartment(department);
            } else {
                throw new RuntimeException("Department is required for Doctor registration");
            }

            doctorRepository.save(doctor);

            // Return empty JWT to signal registration success but login pending approval
            return new JwtResponse(
                    "",
                    savedUser.getId(),
                    savedUser.getUsername(),
                    savedUser.getEmail(),
                    savedUser.getRole(),
                    registerRequest.getPhone(),
                    registerRequest.getAddress(),
                    null
            );
        }
    }
    @Override
    @Transactional
    public void deleteUserAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (user.getRole() == Role.ROLE_PATIENT) {
            patientService.deletePatientByUserId(userId);
            user.setPatient(null);
        } else if (user.getRole() == Role.ROLE_DOCTOR) {
            doctorService.deleteDoctorByUserId(userId);
            user.setDoctor(null);
        }

        user.setDeleted(true);
        user.setEnabled(false);
        userRepository.save(user);
    }
}