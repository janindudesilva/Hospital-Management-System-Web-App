package com.hospital.security;

import com.hospital.model.User;
import com.hospital.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Data
@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {
    
    private Long id;
    private String username;
    private String email;
    private String password;
    private Role role;
    private boolean enabled;
    private String phone;
    private String address;
    private String dateOfBirth;

    public static UserDetailsImpl build(User user) {
        String phone = user.getPhone();
        String address = null;
        String dateOfBirth = null;

        if (user.getRole() == Role.ROLE_PATIENT && user.getPatient() != null) {
            address = user.getPatient().getAddress();
            if (user.getPatient().getDateOfBirth() != null) {
                dateOfBirth = user.getPatient().getDateOfBirth().toString();
            }
        }

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                user.getRole(),
                user.getEnabled(),
                phone,
                address,
                dateOfBirth
        );
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority(role.name()));
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
