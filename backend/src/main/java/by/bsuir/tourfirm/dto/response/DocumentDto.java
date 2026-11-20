package by.bsuir.tourfirm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Представление загруженного документа (без пути на диске). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {

    private Long id;
    private Long tripId;
    private Long ownerId;
    private String fileName;
    private String fileType;
    private LocalDateTime uploadedAt;
}
