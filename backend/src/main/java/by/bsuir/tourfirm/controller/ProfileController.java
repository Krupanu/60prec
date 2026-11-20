package by.bsuir.tourfirm.controller;

import by.bsuir.tourfirm.dto.request.PasswordChangeRequest;
import by.bsuir.tourfirm.dto.request.ProfileUpdateRequest;
import by.bsuir.tourfirm.dto.response.UserDto;
import by.bsuir.tourfirm.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Профиль текущего пользователя. */
@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public UserDto getProfile() {
        return profileService.getProfile();
    }

    @PutMapping
    public UserDto updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return profileService.updateProfile(request);
    }

    @PatchMapping("/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody PasswordChangeRequest request) {
        profileService.changePassword(request);
        return ResponseEntity.noContent().build();
    }
}
