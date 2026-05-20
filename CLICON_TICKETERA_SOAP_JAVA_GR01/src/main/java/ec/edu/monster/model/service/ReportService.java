package ec.edu.monster.model.service;

import ec.edu.monster.model.dto.InvoiceResponse;
import ec.edu.monster.model.dto.ReportItemResponse;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;

public interface ReportService {

    @GET("reporte/{code}")
    Call<List<ReportItemResponse>> getReportBySoccerGame(@Path("code") String code);

    @GET("reporte/{code}/facturas")
    Call<List<InvoiceResponse>> getInvoicesBySoccerGame(@Path("code") String code);

}