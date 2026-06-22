package ec.edu.monster.model.client;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializer;

import lombok.AccessLevel;
import lombok.Getter;
import okhttp3.OkHttpClient;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

@Getter
public class ApiClient {
    @Getter(value = AccessLevel.NONE)
    private static ApiClient instance;

    @Getter(value = AccessLevel.NONE)
    private OkHttpClient httpClient;

    private Retrofit api;

    private ApiClient() {
        this.httpClient = new OkHttpClient.Builder()
                .build();

        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDateTime.class,
                        (JsonSerializer<LocalDateTime>) (src, typeOfSrc,
                                context) -> new JsonPrimitive(src.format(formatter)))
                .registerTypeAdapter(LocalDateTime.class,
                        (JsonDeserializer<LocalDateTime>) (json, typeOfT,
                                context) -> LocalDateTime
                                        .parse(json.getAsString(), formatter))
                .registerTypeAdapter(ZonedDateTime.class,
                        (JsonDeserializer<ZonedDateTime>) (json, type, context) -> ZonedDateTime
                                .parse(json.getAsString()))
                .create();

        api = new Retrofit.Builder()
                .baseUrl("http://10.40.89.197:8080/WS_TICKETERA_SOAP_JAVA_GR01/api/")
                .client(httpClient)
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build();
    }

    public static synchronized ApiClient getInstance() {
        if (instance == null) {
            instance = new ApiClient();
        }

        return instance;
    }

    public void shutdown() {
        if (httpClient != null) {
            httpClient.dispatcher().executorService().shutdown();

            try {
                if (!httpClient.dispatcher().executorService().awaitTermination(1, TimeUnit.SECONDS)) {
                    httpClient.dispatcher().executorService().shutdownNow();
                }
            } catch (InterruptedException e) {
                httpClient.dispatcher().executorService().shutdownNow();
                Thread.currentThread().interrupt();
            }

            httpClient.connectionPool().evictAll();
        }
    }
}
