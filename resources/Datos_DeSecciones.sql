SELECT
	a.CrsCod as Curso,
    b.CrsDsc as NombreCurso,
    a.ScnCod as  Seccion,
    a.ScnEdf as Edificio,
    a.ScnAul as Aula,
    Hour(a.ScnHorIni) as Inicio,
    Hour(a.ScnHorFin) + 1 as Final,
    a.ScnLns as Lns,
    a.ScnMrt as Mrt,
    a.ScnMrc as Mrc,
    a.ScnJvs as Jvs,
    a.ScnVrn as Vrn,
    a.ScnSbd as Sbd,
    ifnull(cast(c.catecod as char),'NA') as Docente,
    ifnull(c.catenom,'') as NombreDocente,
    'ACT' as Estado
from SCNPOD a
	inner join CURSOS b on a.CrsCod = b.Crscod
    left join 
			REGCRG d on a.podano = d.podano and a.podcod = d.podcod and a.sedecod = d.CglSde 
					and a.CrsCod = d.CglCrscod and a.ScnCod = d.CglScnCod
                    inner join
			CATEDRAT c on d.catecod = c.catecod
where 
	a.podano=2015 and a.podcod=3 and a.sedecod=1 and a.ScnEst = 'ACT';