package ec.edu.monster.model.mapper;

import ec.edu.monster.model.dto.PurchaseResponse;
import ec.edu.monster.model.entity.Purchase;

public class PurchaseMapper {
    public static Purchase toEntity(PurchaseResponse dto) {
        if (dto == null)
            return null;

        return new Purchase(
                dto.idFactura(),
                dto.cedula(),
                dto.fecha(),
                dto.subtotal(),
                dto.iva(),
                dto.total());
    }
}