package ec.edu.monster.model.mapper;

import java.util.List;
import java.util.stream.Collectors;

import ec.edu.monster.model.dto.InvoiceItemResponse;
import ec.edu.monster.model.dto.InvoiceResponse;
import ec.edu.monster.model.entity.Invoice;
import ec.edu.monster.model.entity.InvoiceItem;

public class InvoiceMapper {

    public static InvoiceItem toItemEntity(InvoiceItemResponse dto) {
        if (dto == null)
            return null;

        return new InvoiceItem(
                dto.codigoLocalidad(),
                dto.cantidad(),
                dto.total());
    }

    public static Invoice toEntity(InvoiceResponse dto) {
        if (dto == null)
            return null;

        List<InvoiceItem> items = List.of();
        if (dto.lineas() != null) {
            items = dto.lineas().stream()
                    .map(InvoiceMapper::toItemEntity)
                    .collect(Collectors.toList());
        }

        return new Invoice(
                dto.idFactura(),
                dto.fecha(),
                dto.cedula(),
                dto.total(),
                items);
    }
}