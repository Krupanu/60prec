package by.bsuir.tourfirm.controller;

import by.bsuir.tourfirm.dto.request.BlockUpdateRequest;
import by.bsuir.tourfirm.dto.request.RoleUpdateRequest;
import by.bsuir.tourfirm.dto.request.UserUpdateRequest;
import by.bsuir.tourfirm.dto.response.UserDto;
import by.bsuir.tourfirm.entity.enums.Role;
import by.bsuir.tourfirm.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Управление пользователями (MANAGER). */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public Page<UserDto> getUsers(@RequestParam(required = false) String search,
                                  @RequestParam(required = false) Role role,
                                  @ParameterObject @PageableDefault(size = 20) Pageable pageable) {
        return userService.search(search, role, pageable);
    }

    @GetMapping("/{id}")
    public UserDto getById(@PathVariable Long id) {
        return userService.getById(id);
    }

    @PutMapping("/{id}")
    public UserDto update(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        return userService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/role")
    public UserDto updateRole(@PathVariable Long id, @Valid @RequestBody RoleUpdateRequest request) {
        return userService.updateRole(id, request.getRole());
    }

    @PatchMapping("/{id}/block")
    public UserDto updateBlocked(@PathVariable Long id, @Valid @RequestBody BlockUpdateRequest request) {
        return userService.updateBlocked(id, request.getBlocked());
    }
}
