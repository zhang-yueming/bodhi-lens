package com.bodhilens.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "provenance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Provenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
}
