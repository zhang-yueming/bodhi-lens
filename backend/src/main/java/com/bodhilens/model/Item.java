package com.bodhilens.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "custom_name", length = 200)
    private String customName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Material material;

    @Column(length = 200)
    private String period;

    @Column(name = "length_cm", precision = 10, scale = 2)
    private BigDecimal lengthCm;

    @Column(name = "width_cm", precision = 10, scale = 2)
    private BigDecimal widthCm;

    @Column(name = "height_cm", precision = 10, scale = 2)
    private BigDecimal heightCm;

    @Column(length = 500)
    private String source;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "source_notes", columnDefinition = "TEXT")
    private String sourceNotes;

    @Column(precision = 12, scale = 2)
    private java.math.BigDecimal price;

    @Column(length = 10)
    private String currency;

    @Column(name = "is_owned", nullable = false)
    private Boolean isOwned = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}