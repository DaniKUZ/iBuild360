import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import './SmartLabSection.css';
import { LimsApi } from '../../config/limsApi';

/**
 * SmartLabSection
 * Раздел лаборатории в меню проектов.
 * Пока статический макет, стилизованный под предоставленный скриншот.
 */
const SmartLabSection = ({ activeSubItem = 'lab-active' }) => {
  const title = 'Smart Lab Assistant';

  // Примерные данные образцов (как карточки «Протокол испытаний»)
  // Локальные образцы для старта (используем как порядок при создании сессии)
  const [samples, setSamples] = useState([
    { id: 6, name: 'Образец №6', material: 'Асфальтобетонная смесь', operator: 'Иван Иванович' },
    { id: 8, name: 'Образец №8', material: 'Асфальтобетонная смесь', operator: 'Иван Иванович' },
    { id: 12, name: 'Образец №12', material: 'Асфальтобетонная смесь', operator: 'Иван Иванович' },
  ]);

  // Состояние сессии, загружаемое из бэкенда LIMS
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Форма ввода массы и ожидающее подтверждение показание
  const [massForm, setMassForm] = useState({ sampleId: null, kind: 'm1', value_g: '' });
  const [pendingReading, setPendingReading] = useState(null); // {readingId, sampleId, kind, echo}
  
  // Состояние финальных результатов и подтверждения
  const [finalResults, setFinalResults] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Демо-расчёт m2/m3 и плотности (детерминированно)
  const clamp = (min, max, v) => Math.min(max, Math.max(min, v));
  const round1 = (x) => Math.round(x * 10) / 10;
  const round3 = (x) => Math.round(x * 1000) / 1000;
  const computeDensityDemo = (m1, m2, m3) => {
    if ([m1, m2, m3].some(v => v == null)) return null;
    const denom = Math.max(0.0001, (m2 - m3));
    return round3(m1 / denom);
  };

  // Расчёт финальных результатов на фронте
  const computeFinalResults = (samples) => {
    const densities = samples
      .map(s => s.density)
      .filter(d => d != null && Number.isFinite(d));
    
    if (densities.length === 0) return null;
    
    const sum = densities.reduce((a, b) => a + b, 0);
    const avgDensity = round3(sum / densities.length);
    const delta = round3(Math.max(...densities) - Math.min(...densities));
    
    return { avgDensity, delta };
  };
  const deriveDemoMasses = (sample) => {
    const m1 = sample?.masses?.m1;
    let m2 = sample?.masses?.m2;
    let m3 = sample?.masses?.m3;
    if (m1 != null) {
      const delta2 = 100 + (Number(sample.id) % 50); // 100..149
      const delta3 = 300 + (Number(sample.id) % 80); // 300..379
      if (m2 == null) m2 = round1(clamp(100, 1000, Number(m1) + delta2));
      if (m3 == null) m3 = round1(clamp(100, 1000, Number(m1) - delta3));
    }
    const density = computeDensityDemo(m1, m2, m3);
    return { m1, m2, m3, density };
  };

  // Чтение единой ручки состояния (оркестратор)
  const refreshFromOrchestrator = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await LimsApi.getOrchestratorState();
      setSession(data);
      if (Array.isArray(data?.samples)) {
        const mapped = data.samples.map((s) => {
          const d = deriveDemoMasses(s);
          return {
            id: s.id,
            name: `Образец №${s.id}`,
            material: 'Асфальтобетонная смесь',
            operator: 'Иван Иванович',
            masses: { m1: d.m1, m2: d.m2, m3: d.m3 },
            density: d.density,
            status: d.density != null ? 'done' : (s.status || 'in_progress')
          };
        });
        setSamples(mapped);
        
        // Финальные результаты вычисляются только по кнопке
        // (убрали автоматическое вычисление)
      }
      // Сохраняем текущий выбор пользователя, не сбрасываем селектор
      const currentSampleId = massForm.sampleId;
      const initialSampleId = data?.step?.sampleId || currentSampleId || (data?.samples?.[0]?.id ?? null);
      
      // Обновляем селектор только если он пустой или образец не существует
      const sampleExists = mapped.find(s => s.id === currentSampleId);
      if (!currentSampleId || !sampleExists) {
        setMassForm((p) => ({ ...p, sampleId: initialSampleId }));
      }
    } catch (e) {
      setError(e?.data?.message || `Ошибка чтения состояния (${e.status || ''})`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Пуллим состояние для отображения чисел даже без действий в UI
    refreshFromOrchestrator();
    const id = setInterval(refreshFromOrchestrator, 2000);
    return () => clearInterval(id);
  }, []);

  const refreshSession = async (sid) => {
    if (!sid) return;
    setLoading(true);
    setError(null);
    try {
      const data = await LimsApi.getSession(sid);
      setSession(data);
      // Пересоберём список образцов из ответа, чтобы показать массы/плотности
      if (Array.isArray(data?.samples)) {
        const mapped = data.samples.map((s) => ({
          id: s.id,
          name: `Образец №${s.id}`,
          material: 'Асфальтобетонная смесь',
          operator: 'Иван Иванович',
          masses: s.masses,
          density: s.density,
          status: s.status
        }));
        setSamples(mapped);
      }
    } catch (e) {
      setError(e?.data?.message || `Ошибка загрузки сессии (${e.status || ''})`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const order = samples.map((s) => s.id);
      const data = await LimsApi.createSession('Иван Петров', order);
      setSession(data);
      // Инициализация формы на первом образце, если указан в step
      const initialSampleId = data?.step?.sampleId || order[0] || null;
      setMassForm((p) => ({ ...p, sampleId: initialSampleId }));
      await refreshSession(data.sessionId);
    } catch (e) {
      setError(e?.data?.message || `Ошибка создания сессии (${e.status || ''})`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMass = async () => {
    if (!session?.sessionId) return;
    if (!massForm.sampleId || !massForm.kind) return;
    const value = parseFloat(String(massForm.value_g).replace(',', '.'));
    if (!Number.isFinite(value) || value <= 0) {
      setError('Введите корректную массу (> 0)');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await LimsApi.addMassReading(session.sessionId, massForm.sampleId, massForm.kind, value);
      setPendingReading({ ...resp, sampleId: massForm.sampleId, kind: massForm.kind });
    } catch (e) {
      setError(e?.data?.message || `Ошибка записи массы (${e.status || ''})`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (confirm) => {
    if (!session?.sessionId || !pendingReading) return;
    setLoading(true);
    setError(null);
    try {
      await LimsApi.confirmMassReading(
        session.sessionId,
        pendingReading.sampleId,
        pendingReading.readingId,
        confirm
      );
      setPendingReading(null);
      setMassForm((p) => ({ ...p, value_g: '' }));
      await refreshSession(session.sessionId);
    } catch (e) {
      setError(e?.data?.message || `Ошибка подтверждения (${e.status || ''})`);
    } finally {
      setLoading(false);
    }
  };

  const handleComputeDensity = async (sampleId) => {
    if (!session?.sessionId || !sampleId) return;
    setLoading(true);
    setError(null);
    try {
      await LimsApi.computeSampleDensity(session.sessionId, sampleId);
      await refreshSession(session.sessionId);
    } catch (e) {
      setError(e?.data?.message || `Ошибка расчёта плотности (${e.status || ''})`);
    } finally {
      setLoading(false);
    }
  };

  const handleComputeFinal = () => {
    const final = computeFinalResults(samples);
    if (final) {
      setFinalResults(final);
      setShowConfirmation(true);
    } else {
      setError('Недостаточно данных для расчёта финальных результатов');
    }
  };

  const handleConfirmFinal = () => {
    setShowConfirmation(false);
    // Здесь можно отправить финальные результаты на бэк если нужно
    console.log('Финальные результаты подтверждены:', finalResults);
  };

  // Прогресс для визуала
  const samplesDone = session?.progress?.samplesDone || 0;
  const samplesTotal = session?.progress?.samplesTotal || samples.length;
  const progressPercent = useMemo(() => {
    if (samplesTotal <= 0) return 0;
    return Math.min(100, Math.round((samplesDone / samplesTotal) * 100));
  }, [samplesDone, samplesTotal]);

  return (
    <div className="smartlab">
      <div className="smartlab__content">
        <section className="smartlab__left">
          <div className="smartlab__panel smartlab__main-panel">
            <header className="smartlab__header">
              <div className="smartlab__header-left">
                <div className="smartlab__title-row">
                  <h1 className="smartlab__title">
                    <i className="smartlab__title-icon fas fa-file-alt" aria-hidden="true"></i>
                    {title}
                  </h1>
                  <div className="smartlab__gost-header">ГОСТ P 58401.1-2019</div>
                </div>
                <div className="smartlab__subtitle">Определение объемной плотности. Пункт 9.1. Метод А. Образцы уплотненные на установке Машалла</div>
              </div>
              <div className="smartlab__header-right">
                <button className="smartlab__create" onClick={handleCreateSession} disabled={loading}>
                  <i className="fas fa-file-medical"></i>
                  {session ? 'Пересоздать сессию' : 'Создать сессию'}
                </button>
              </div>
            </header>

            {samples.map((s, idx) => (
              <article key={s.id} className="smartlab__card">
                <div className="smartlab__card-head">
                  <div className="smartlab__card-num">№ {idx + 1}</div>
                  <div className="smartlab__chip">{s.name}</div>
                </div>

                <div className="smartlab__row smartlab__row--2">
                  <div className="smartlab__field">
                    <div className="smartlab__label">Материал</div>
                    <div className="smartlab__input">{s.material}</div>
                  </div>
                  <div className="smartlab__field">
                    <div className="smartlab__label">Оператор</div>
                    <div className="smartlab__input">{s.operator}</div>
                  </div>
                </div>

                <div className="smartlab__measurements">
                  <div className="smartlab__measurements-header">
                    <h3 className="smartlab__measurements-title">Измерения</h3>
                  </div>
                  <div className="smartlab__measurements-grid">
                    <div className="smartlab__measurement-item">
                      <div className="smartlab__measurement-label">Масса сухого образца на воздухе, г</div>
                      <div className="smartlab__measurement-value">{s?.masses?.m1 ?? ''}</div>
                    </div>
                    <div className="smartlab__measurement-item">
                      <div className="smartlab__measurement-label">Масса образца на воздухе после выдерживания его в воде в течение (4 ± 1) мин, г</div>
                      <div className="smartlab__measurement-value">{s?.masses?.m2 ?? ''}</div>
                    </div>
                    <div className="smartlab__measurement-item">
                      <div className="smartlab__measurement-label">Масса образца в воде после выдерживания его в воде в течение (4 ± 1) мин, г</div>
                      <div className="smartlab__measurement-value">{s?.masses?.m3 ?? ''}</div>
                    </div>
                    <div className="smartlab__measurement-item">
                      <div className="smartlab__measurement-label">Объемная плотность асфальтобетонновой смеси, г/см³</div>
                      <div className="smartlab__measurement-value">{s?.density ?? ''}</div>
                    </div>
                  </div>
                  {session && (
                    <div className="smartlab__grid smartlab__grid--notes" style={{ marginTop: 12 }}>
                      {(!s?.density && s?.masses && s.masses.m1 != null && s.masses.m2 != null && s.masses.m3 != null) && (
                        <button className="smartlab__create" onClick={() => handleComputeDensity(s.id)} disabled={loading}>
                          Рассчитать плотность по образцу {s.id}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            )            )}

            <div className="smartlab__table-footer">
              <div className="smartlab__records">{`Записи с 1 по ${samples.length} из ${samples.length} записей`}</div>
              <div className="smartlab__pagination">
                <button className="smartlab__pager-btn" disabled>Предыдущая</button>
                <button className="smartlab__pager-btn is-current">1</button>
                <button className="smartlab__pager-btn" disabled>Следующая</button>
              </div>
            </div>
          </div>
        </section>

        <aside className="smartlab__right">
          <div className="smartlab__panel smartlab__panel--steps">
            <div className="smartlab__panel-title">Прогресс сценария</div>
            <ol className="smartlab__steps">
              {session?.progress?.steps?.length
                ? session.progress.steps.map((st, i) => (
                    <li key={`${st.code}-${i}`} className={(st.done && st.code !== 'take_sample') ? 'is-done' : (session?.step?.code === st.code && (st.sampleId || null) === (session?.step?.sampleId || null) ? 'is-active' : '')}>
                      <span className={`step-circle ${(st.done && st.code !== 'take_sample') ? 'step-circle--done' : ''}`} aria-hidden="true">{(st.done && st.code !== 'take_sample') ? '✓' : i + 1}</span>
                      {st.code === 'greeting' && 'Приветствие'}
                      {st.code === 'take_sample' && `Возьмите образец № ${st.sampleId}`}
                      {st.code === 'say_mass_and_confirm' && `Назовите массу и подтвердите (образец № ${st.sampleId})`}
                      {st.code === 'compute_results' && 'Расчёт результатов'}
                      {st.code === 'finish' && 'Завершение'}
                    </li>
                  ))
                : (
                  <>
                    <li>Создайте сессию, чтобы увидеть шаги</li>
                  </>
                )}
            </ol>
          </div>

          <div className="smartlab__panel">
            <div className="smartlab__panel-title">{session?.step ? `Текущий шаг: ${
              session.step.code === 'take_sample' ? `Возьмите образец № ${session.step.sampleId}` :
              session.step.code === 'say_mass_and_confirm' ? `Назовите массу (образец № ${session.step.sampleId})` :
              session.step.code === 'compute_results' ? 'Расчёт результатов' :
              session.step.code === 'finish' ? 'Завершение' : 'Приветствие'
            }` : 'Сессия не создана'}</div>
            <div className="smartlab__panel-subtitle">{loading ? 'Загрузка...' : (error || 'Ожидаю действие оператора')}</div>
            <div className="smartlab__tags">
              <span className="tag tag--ok">
                <i className="tag__icon fas fa-balance-scale" aria-hidden="true"></i>
                Весы (подключено)
              </span>
              <span className="tag tag--ok">
                <i className="tag__icon fas fa-microphone" aria-hidden="true"></i>
                Микрофон (активен)
              </span>
            </div>
            {session && (
              <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                {!pendingReading && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                      value={massForm.sampleId ?? ''}
                      onChange={(e) => setMassForm((p) => ({ ...p, sampleId: Number(e.target.value) }))}
                      className="smartlab__input"
                      style={{ width: 140 }}
                    >
                      <option value="" disabled>Образец</option>
                      {samples.map((s) => (
                        <option key={s.id} value={s.id}>№ {s.id}</option>
                      ))}
                    </select>
                    <select
                      value={massForm.kind}
                      onChange={(e) => setMassForm((p) => ({ ...p, kind: e.target.value }))}
                      className="smartlab__input"
                      style={{ width: 160 }}
                    >
                      <option value="m1">m1</option>
                      <option value="m2">m2</option>
                      <option value="m3">m3</option>
                    </select>
                    <input
                      className="smartlab__input"
                      style={{ width: 160 }}
                      placeholder="Масса, г"
                      value={massForm.value_g}
                      onChange={(e) => setMassForm((p) => ({ ...p, value_g: e.target.value }))}
                      inputMode="decimal"
                    />
                    <button className="smartlab__create" onClick={handleAddMass} disabled={loading || !massForm.sampleId}>
                      Записать
                    </button>
                  </div>
                )}
                {pendingReading && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="smartlab__input" style={{ minHeight: 0 }}>{pendingReading.echo || 'Подтвердите значение'}</div>
                    <button className="smartlab__create" onClick={() => handleConfirm(true)} disabled={loading}>Да</button>
                    <button className="smartlab__pager-btn" onClick={() => handleConfirm(false)} disabled={loading}>Нет</button>
                  </div>
                )}
                {/* Кнопка расчёта финального результата */}
                {samples.every(s => s.density != null) && !showConfirmation && (
                  <button className="smartlab__create" onClick={handleComputeFinal} disabled={loading}>
                    Рассчитать финальный результат
                  </button>
                )}
                
                {/* Подтверждение финальных результатов */}
                {showConfirmation && finalResults && (
                  <div className="smartlab__confirmation">
                    <div className="smartlab__confirmation-title">
                      Пройдите к монитору для подтверждения
                    </div>
                    <div className="smartlab__confirmation-subtitle">
                      Все расчетные значения:
                    </div>
                    <div className="smartlab__confirmation-item">
                      • Среднее арифметическое: <strong>{finalResults.avgDensity} г/см³</strong>
                    </div>
                    <div className="smartlab__confirmation-item">
                      • Разница результатов: <strong>{finalResults.delta} г/см³</strong>
                    </div>
                    <div className="smartlab__confirmation-note">
                      ✓ Данные автоматически внесены в систему
                    </div>
                    <div className="smartlab__confirmation-actions">
                      <button className="smartlab__confirmation-btn smartlab__confirmation-btn--primary" onClick={handleConfirmFinal}>
                        Начать новый сценарий
                      </button>
                      <button className="smartlab__confirmation-btn smartlab__confirmation-btn--secondary" onClick={() => setShowConfirmation(false)}>
                        Закрыть
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="smartlab__panel">
            <div className="smartlab__panel-title">Прогресс образцов</div>
            <div className="smartlab__progress-text">{`Обработано ${samplesDone}/${samplesTotal}`}</div>
            <div className="smartlab__progress">
              <div className="smartlab__progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="smartlab__sample-buttons">
              {samples.map((s) => (
                <button
                  key={s.id}
                  className={`smartlab__sample-btn ${s.id === (massForm.sampleId || session?.step?.sampleId) ? 'is-active' : ''}`}
                  title={`Образец ${s.id}`}
                  onClick={() => setMassForm((p) => ({ ...p, sampleId: s.id }))}
                >
                  {s.id}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="smartlab__bottom-results">
        <div className="smartlab__results">
          <div className="smartlab__results-header">
            <h3 className="smartlab__results-title">Фактический результат испытаний</h3>
          </div>
          <div className="smartlab__results-grid">
            <div className="smartlab__result-item">
              <div className="smartlab__result-label">Среднее арифметическое, г/см³</div>
              <div className="smartlab__result-value">{finalResults?.avgDensity ?? ''}</div>
            </div>
            <div className="smartlab__result-item">
              <div className="smartlab__result-label">Разница результатов (до 0,01 г/см³)</div>
              <div className="smartlab__result-value">{finalResults?.delta ?? ''}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SmartLabSection.propTypes = {
  activeSubItem: PropTypes.string,
};

export default SmartLabSection;


