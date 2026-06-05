package com.bodhilens.repository;

import com.bodhilens.model.Provenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProvenanceRepository extends JpaRepository<Provenance, Long> {

    List<Provenance> findByItemIdOrderBySortOrderAsc(Long itemId);

    @Modifying
    @Query("DELETE FROM Provenance p WHERE p.itemId = :itemId")
    void deleteAllByItemId(@Param("itemId") Long itemId);
}
