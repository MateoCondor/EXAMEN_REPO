package ec.edu.monster.controller;

import ec.edu.monster.model.client.PurchaseClient;
import ec.edu.monster.model.dto.PurchaseItemRequest;
import ec.edu.monster.model.dto.PurchaseRequest;
import ec.edu.monster.model.entity.Purchase;
import ec.edu.monster.model.exceptions.ApiException;
import ec.edu.monster.view.PurchaseView;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
public class PurchaseController {
    private final PurchaseClient client;
    private final PurchaseView view;

    /**
     * Guía al usuario en la compra de múltiples boletos para distintas localidades.
     */
    public void executePurchaseFlow() {
        System.out.println("\n--- 🛒 PROCESO DE COMPRA MULTI-LOCALIDAD ---");

        // 1. Datos iniciales de la cabecera de la factura
        String cedula = view.requestString("👤 Ingrese su número de cédula: ");
        if (cedula.isEmpty()) {
            view.displayError("La cédula es requerida para emitir la factura.");
            return;
        }

        String codigoPartido = view.requestString("⚽ Ingrese el CÓDIGO del partido: ");
        if (codigoPartido.isEmpty()) {
            view.displayError("El código del partido es requerido.");
            return;
        }

        // Lista dinámica para actuar como el "carrito de compras" de localidades
        List<PurchaseItemRequest> lineasCompra = new ArrayList<>();
        boolean agregarMas;

        // 2. Bucle interactivo para recolectar las distintas localidades
        do {
            System.out.println("\n-> Añadiendo localidad al desglose:");
            String codigoLocalidad = view.requestString("   🏟️ Código de localidad (ej: GENERAL, PALCO): ");

            if (codigoLocalidad.isEmpty()) {
                System.out.println("   ⚠️ El código no puede estar vacío. Ítem omitido.");
                agregarMas = view.requestKeepAdding();
                continue;
            }

            int cantidad = view.requestAmount("   🔢 Cantidad de boletos: ");

            // Agregamos el ítem al listado intermedio
            lineasCompra.add(new PurchaseItemRequest(codigoLocalidad, cantidad));
            System.out.println("   ✅ Localidad agregada al detalle.");

            // Preguntar si desea ingresar otra fila en la factura
            agregarMas = view.requestKeepAdding();

        } while (agregarMas);

        // Validamos que el usuario haya ingresado al menos un ítem válido
        if (lineasCompra.isEmpty()) {
            view.displayError("No se agregaron localidades válidas. Compra cancelada.");
            return;
        }

        // 3. Empaquetar todo el listado acumulado en el Request definitivo
        PurchaseRequest purchaseDto = new PurchaseRequest(codigoPartido, cedula, lineasCompra);

        try {
            System.out.println("\n⏳ Procesando transacciones con el servidor remoto...");

            // 4. Se envía la orden con todas sus líneas de golpe
            Purchase receipt = client.create(purchaseDto);

            // 5. Se renderiza la respuesta exitosa calculada por el backend
            view.displayReceipt(receipt);

        } catch (ApiException e) {
            // Captura los errores de validación (Ej: "La localidad PALCO no tiene asientos
            // suficientes")
            view.displayError(e.getMessage());
        } catch (Exception e) {
            view.displayError("No se pudo conectar con el servidor de facturación.");
        }
    }
}