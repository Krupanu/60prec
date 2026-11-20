package by.bsuir.tourfirm.service;

import by.bsuir.tourfirm.dto.request.UserUpdateRequest;
import by.bsuir.tourfirm.dto.response.UserDto;
import by.bsuir.tourfirm.entity.User;
import by.bsuir.tourfirm.entity.enums.Role;
import by.bsuir.tourfirm.exception.ConflictException;
import by.bsuir.tourfirm.exception.ResourceNotFoundException;
import by.bsuir.tourfirm.mapper.UserMapper;
import by.bsuir.tourfirm.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/** Управление пользователями (MANAGER). */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    /** Поиск пользователей по email/имени/фамилии с фильтром по роли. */
    @Transactional(readOnly = true)
    public Page<UserDto> search(String search, Role role, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(search)) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("firstName")), pattern),
                        cb.like(cb.lower(root.get("lastName")), pattern)
                ));
            }
            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return userRepository.findAll(spec, pageable).map(userMapper::toDto);
    }

    @Transactional(readOnly = true)
    public UserDto getById(Long id) {
        return userMapper.toDto(findUser(id));
    }

    @Transactional
    public UserDto update(Long id, UserUpdateRequest request) {
        User user = findUser(id);
        if (StringUtils.hasText(request.getEmail()) && !user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ConflictException("Пользователь с таким email уже зарегистрирован");
            }
            user.setEmail(request.getEmail());
        }
        if (StringUtils.hasText(request.getFirstName())) {
            user.setFirstName(request.getFirstName());
        }
        if (StringUtils.hasText(request.getLastName())) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        return userMapper.toDto(userRepository.save(user));
    }

    @Transactional
    public void delete(Long id) {
        userRepository.delete(findUser(id));
    }

    @Transactional
    public UserDto updateRole(Long id, Role role) {
        User user = findUser(id);
        user.setRole(role);
        return userMapper.toDto(userRepository.save(user));
    }

    @Transactional
    public UserDto updateBlocked(Long id, boolean blocked) {
        User user = findUser(id);
        user.setBlocked(blocked);
        return userMapper.toDto(userRepository.save(user));
    }

    public User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден: id=" + id));
    }
}
