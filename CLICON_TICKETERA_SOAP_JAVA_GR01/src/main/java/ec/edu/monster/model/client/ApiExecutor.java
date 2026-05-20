package ec.edu.monster.model.client;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

import com.google.gson.Gson;

import ec.edu.monster.model.dto.ApiErrorResponse;
import ec.edu.monster.model.exceptions.ApiException;
import retrofit2.Call;
import retrofit2.Response;

public class ApiExecutor {

    private static final Gson gson = new Gson();

    public static <T> T execute(Call<T> call, Map<Integer, String> errorMapping) {
        try {
            Response<T> response = call.execute();
            int statusCode = response.code();

            if (response.isSuccessful()) {
                if (statusCode == 204 || response.body() == null)
                    return null;

                return response.body();
            }

            String mensajeErrorApi = null;
            if (response.errorBody() != null) {
                try {

                    String errorJson = response.errorBody().string();
                    ApiErrorResponse errorObject = gson.fromJson(errorJson, ApiErrorResponse.class);

                    if (errorObject != null && errorObject.mensaje() != null) {
                        mensajeErrorApi = errorObject.mensaje();
                    }
                } catch (Exception e) {

                }
            }

            if (errorMapping.containsKey(statusCode)) {
                throw new ApiException(errorMapping.get(statusCode));
            }

            if (mensajeErrorApi != null && !mensajeErrorApi.isEmpty()) {
                throw new ApiException(mensajeErrorApi);
            }

            throw new ApiException("Error inesperado del servidor (Http code: " + statusCode + ")");

        } catch (IOException e) {
            throw new ApiException("Error de comunicación", e);
        }
    }

    public static <T> T execute(Call<T> call) {
        return execute(call, Collections.emptyMap());
    }
}