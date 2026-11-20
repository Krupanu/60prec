package by.bsuir.tourfirm.service;

import by.bsuir.tourfirm.dto.request.TripRequest;
import by.bsuir.tourfirm.dto.response.TripDto;
import by.bsuir.tourfirm.entity.Tour;
import by.bsuir.tourfirm.entity.Transport;
import by.bsuir.tourfirm.entity.Trip;
import by.bsuir.tourfirm.entity.User;
import by.bsuir.tourfirm.entity.enums.Role;
import by.bsuir.tourfirm.entity.enums.TripStatus;
import by.bsuir.tourfirm.exception.BadRequestException;
import by.bsuir.tourfirm.exception.ConflictException;
import by.bsuir.tourfirm.exception.ForbiddenException;
import by.bsuir.tourfirm.exception.ResourceNotFoundException;
import by.bsuir.tourfirm.mapper.TripMapper;
import by.bsuir.tourfirm.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/** Рейсы: назначение транспорта на тур и управление статусами перевозки. */
@Service
@RequiredArgsConstructor
public class TripService {

    /** Допустимые переходы статусов: SCHEDULED→READY→EN_ROUTE→COMPLETED. */
    private static final Map<TripStatus, TripStatus> NEXT_STATUS = Map.of(
            TripStatus.SCHEDULED, TripStatus.READY,
            TripStatus.READY, TripStatus.EN_ROUTE,
            TripStatus.EN_ROUTE, TripStatus.COMPLETED
    );

    private final TripRepository tripRepository;
    private final TourService tourService;
    private final TransportService transportService;
    private final CurrentUserService currentUserService;
    private final TripMapper tripMapper;

    /** Назначение рейса менеджером; владелец ТС проверяется в TransportService. */
    @Transactional
    public TripDto create(TripRequest request) {
        Tour tour = tourService.findTour(request.getTourId());
        Transport transport = transportService.findTransport(request.getTransportId());
        if (transport.getOwner().getRole() != Role.VEHICLE_OWNER) {
            throw new BadRequestException("Транспорт не закреплён за владельцем (VEHICLE_OWNER)");
        }
        Trip trip = Trip.builder()
                .tour(tour)
                .transport(transport)
                .departureDate(request.getDepartureDate())
                .status(TripStatus.SCHEDULED)
                .build();
        return tripMapper.toDto(tripRepository.save(trip));
    }

    @Transactional(readOnly = true)
    public Page<TripDto> getAll(TripStatus status, Pageable pageable) {
        Page<Trip> page = status != null
                ? tripRepository.findAllByStatus(status, pageable)
                : tripRepository.findAll(pageable);
        return page.map(tripMapper::toDto);
    }

    /** Рейсы транспорта текущего владельца (VEHICLE_OWNER). */
    @Transactional(readOnly = true)
    public List<TripDto> getMy() {
        User current = currentUserService.getCurrentUser();
        return tripRepository.findAllByTransportOwnerId(current.getId()).stream()
                .map(tripMapper::toDto)
                .toList();
    }

    /**
     * Смена статуса рейса владельцем транспорта.
     * Разрешены только последовательные переходы SCHEDULED→READY→EN_ROUTE→COMPLETED.
     */
    @Transactional
    public TripDto updateStatus(Long id, TripStatus newStatus) {
        Trip trip = findTrip(id);
        User current = currentUserService.getCurrentUser();
        checkTripOwner(trip, current);

        TripStatus expected = NEXT_STATUS.get(trip.getStatus());
        if (expected == null || newStatus != expected) {
            throw new ConflictException("Недопустимый переход статуса рейса: "
                    + trip.getStatus() + " → " + newStatus
                    + (expected != null ? ". Ожидается: " + expected : ""));
        }
        trip.setStatus(newStatus);
        return tripMapper.toDto(tripRepository.save(trip));
    }

    /** Отмена рейса менеджером. */
    @Transactional
    public TripDto cancel(Long id) {
        Trip trip = findTrip(id);
        if (trip.getStatus() == TripStatus.COMPLETED) {
            throw new ConflictException("Нельзя отменить завершённый рейс");
        }
        if (trip.getStatus() == TripStatus.CANCELLED) {
            throw new ConflictException("Рейс уже отменён");
        }
        trip.setStatus(TripStatus.CANCELLED);
        return tripMapper.toDto(tripRepository.save(trip));
    }

    public Trip findTrip(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Рейс не найден: id=" + id));
    }

    /** Проверка, что рейс выполняет транспорт текущего владельца. */
    private void checkTripOwner(Trip trip, User current) {
        if (!trip.getTransport().getOwner().getId().equals(current.getId())) {
            throw new ForbiddenException("Управлять можно только рейсами своего транспорта");
        }
    }
}
