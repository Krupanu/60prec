package by.bsuir.tourfirm.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Документ, загруженный владельцем транспорта по рейсу (путевой лист и т.п.). */
@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_type")
    private String fileType;

    /** Путь к файлу на диске (в каталоге uploads). */
    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Builder.Default
    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
