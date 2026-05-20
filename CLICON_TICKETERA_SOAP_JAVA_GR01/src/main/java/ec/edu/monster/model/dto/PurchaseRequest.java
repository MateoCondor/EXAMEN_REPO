package ec.edu.monster.model.dto;

import java.util.List;

public record PurchaseRequest(
        String codigoPartido,
        String cedula,
        List<PurchaseItemRequest> lineas) {
}