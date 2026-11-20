package by.bsuir.tourfirm.entity;

import by.bsuir.tourfirm.entity.enums.TripStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/** Рейс: назначение транспортного средства на тур в конкретную дату. */
@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transport_id", nullable = false)
    private Transport transport;

    @Column(name = "departure_date", nullable = false)
    private LocalDate departureDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TripStatus status;
}
