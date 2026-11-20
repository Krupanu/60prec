package by.bsuir.tourfirm.entity;

import by.bsuir.tourfirm.entity.enums.TransportType;
import jakarta.persistence.*;
import lombok.*;

/** Транспортное средство, принадлежащее владельцу (VEHICLE_OWNER). */
@Entity
@Table(name = "transports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String model;

    @Column(name = "plate_number", nullable = false, unique = true)
    private String plateNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransportType type;

    @Column(nullable = false)
    private int seats;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
}
