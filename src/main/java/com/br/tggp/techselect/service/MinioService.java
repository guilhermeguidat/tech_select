package com.br.tggp.techselect.service;

import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class MinioService {

    private final MinioClient minioClient;

    @org.springframework.beans.factory.annotation.Value("${minio.bucket}")
    private String BUCKET;

    public String subirArquivo(String nomeObjeto, InputStream stream, String contentType) throws Exception {
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(BUCKET)
                        .object(nomeObjeto)
                        .stream(stream, -1, 10485760)
                        .contentType(contentType)
                        .build());

        return String.format("http://localhost:9100/%s/%s", BUCKET, nomeObjeto);
    }
}
