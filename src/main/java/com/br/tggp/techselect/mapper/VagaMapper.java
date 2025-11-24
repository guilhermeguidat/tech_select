package com.br.tggp.techselect.mapper;

import com.br.tggp.techselect.dto.SetorResponse;
import com.br.tggp.techselect.dto.SkillResponse;
import com.br.tggp.techselect.dto.VagaRequest;
import com.br.tggp.techselect.dto.VagaResponse;
import com.br.tggp.techselect.model.Recrutador;
import com.br.tggp.techselect.model.Setor;
import com.br.tggp.techselect.model.Skill;
import com.br.tggp.techselect.model.Vaga;

import java.util.List;

public class VagaMapper {

    public static Vaga toEntity(VagaRequest dto) {
        if (dto == null)
            return null;

        Vaga v = new Vaga();
        v.setTituloVaga(dto.getTituloVaga());
        v.setNivel(dto.getNivel());
        v.setExpMin(dto.getExpMin());
        v.setExpMin(dto.getExpMin());
        v.setDescricao(dto.getDescricao());
        v.setStatus(dto.getStatus());
        if (dto.getSkills() != null) {
            List<Skill> skills = SkillMapper.toListEntity(dto.getSkills());
            v.setSkills(skills);
        }
        Setor s = new Setor();
        s.setIdSetor(dto.getIdSetor());
        v.setSetor(s);
        Recrutador r = new Recrutador();
        r.setIdRecrutador(dto.getIdRecrutador());
        v.setRecrutador(r);
        return v;
    }

    public static VagaResponse toResponse(Vaga entity) {
        if (entity == null)
            return null;

        List<SkillResponse> skills = null;
        if (entity.getSkills() != null)
            skills = SkillMapper.toListResponse(entity.getSkills());

        SetorResponse setorResponse = SetorMapper.toResponse(entity.getSetor());

        String nomeEmpresa = "";
        String urlLogo = "";
        if (entity.getRecrutador() != null) {
            nomeEmpresa = entity.getRecrutador().getNomeEmpresa();
            urlLogo = entity.getRecrutador().getUrlLogo();
        }

        VagaResponse vagaResponse = new VagaResponse(
                entity.getIdVaga(),
                entity.getTituloVaga(),
                entity.getNivel(),
                entity.getExpMin(),
                entity.getDescricao(),
                entity.getRecrutador().getIdRecrutador(),
                setorResponse,
                skills,
                entity.getStatus(),
                nomeEmpresa,
                urlLogo);

        return vagaResponse;
    }

    public static List<VagaResponse> toListResponse(List<Vaga> entities) {
        return entities.stream()
                .map(VagaMapper::toResponse)
                .toList();
    }
}
