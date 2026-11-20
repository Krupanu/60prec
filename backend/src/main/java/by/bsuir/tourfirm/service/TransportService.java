package by.bsuir.tourfirm.service;

import by.bsuir.tourfirm.dto.request.TransportRequest;
import by.bsuir.tourfirm.dto.response.TransportDto;
import by.bsuir.tourfirm.entity.Transport;
import by.bsuir.tourfirm.entity.User;
import by.bsuir.tourfirm.entity.enums.Role;
import by.bsuir.tourfirm.exception.BadRequestException;
import by.bsuir.tourfirm.exception.ConflictException;
import by.bsuir.tourfirm.exception.ResourceNotFoundException;
import by.bsuir.tourfirm.mapper.TransportMapper;
import by.bsuir.tourfirm.repository.TransportRepository;
import by.bsuir.tourfirm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Управление транспортными средствами. */
@Service
@RequiredArgsConstructor
public class TransportService {

    private final TransportRepository transportRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final TransportMapper transportMapper;

    @Transactional(readOnly = true)
    public Page<TransportDto> getAll(Pageable pageable) {
        return transportRepository.findAll(pageable).map(transportMapper::toDto);
    }

    @Transactional(readOnly = true)
    public TransportDto getById(Long id) {
        return transportMapper.toDto(findTransport(id));
    }

    /** Транспорт владельца, выполняющего запрос (VEHICLE_OWNER). */
    @Transactional(readOnly = true)
    public List<TransportDto> getMy() {
        User current = currentUserService.getCurrentUser();
        return transportRepository.findAllByOwnerId(current.getId()).stream()
                .map(transportMapper::toDto)
                .toList();
    }

    @Transactional
    public TransportDto create(TransportRequest request) {
        User owner = findVehicleOwner(request.getOwnerId());
        if (transportRepository.existsByPlateNumber(request.getPlateNumber())) {
            throw new ConflictException("Транспорт с таким госномером уже существует");
        }
        Transport transport = Transport.builder()
                .model(request.getModel())
                .plateNumber(request.getPlateNumber())
                .type(request.getType())
                .seats(request.getSeats())
                .owner(owner)
                .build();
        return transportMapper.toDto(transportRepository.save(transport));
    }

    @Transactional
    public TransportDto update(Long id, TransportRequest request) {
        Transport transport = findTransport(id);
        User owner = findVehicleOwner(request.getOwnerId());
        if (!transport.getPlateNumber().equals(request.getPlateNumber())
                && transportRepository.existsByPlateNumber(request.getPlateNumber())) {
            throw new ConflictException("Транспорт с таким госномером уже существует");
        }
        transport.setModel(request.getModel());
        transport.setPlateNumber(request.getPlateNumber());
        transport.setType(request.getType());
        transport.setSeats(request.getSeats());
        transport.setOwner(owner);
        return transportMapper.toDto(transportRepository.save(transport));
    }

    @Transactional
    public void delete(Long id) {
        transportRepository.delete(findTransport(id));
    }

    public Transport findTransport(Long id) {
        return transportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Транспорт не найден: id=" + id));
    }

    /** Владельцем транспорта может быть только пользователь с ролью VEHICLE_OWNER. */
    private User findVehicleOwner(Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new BadRequestException("Владелец транспорта не найден: id=" + ownerId));
        if (owner.getRole() != Role.VEHICLE_OWNER) {
            throw new BadRequestException("Пользователь id=" + ownerId + " не является владельцем транспорта (VEHICLE_OWNER)");
        }
        return owner;
    }
}
