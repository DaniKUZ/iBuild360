import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './SmartLabSection.css';

/**
 * SmartLabSection
 * Раздел лаборатории в меню проектов.
 * Пока статический макет, стилизованный под предоставленный скриншот.
 */
const SmartLabSection = ({ activeSubItem = 'lab-active' }) => {
  const title = 'Протокол испытания';

  // Примерные данные образцов (как карточки «Протокол испытаний»)
  const [samples, setSamples] = useState([
    { id: 6, name: 'Образец №6', material: 'Асфальтобетонная смесь', operator: 'Иван Иванович' },
    { id: 8, name: 'Образец №8', material: 'Асфальтобетонная смесь', operator: 'Иван Иванович' },
    { id: 12, name: 'Образец №12', material: 'Асфальтобетонная смесь', operator: 'Иван Иванович' },
  ]);

  const handleCreateProtocol = () => {
    const nextId = (samples.length > 0 ? Math.max(...samples.map((s) => s.id)) : 0) + 1;
    const newSample = {
      id: nextId,
      name: `Образец №${nextId}`,
      material: 'Асфальтобетонная смесь',
      operator: 'Иван Иванович',
    };
    setSamples((prev) => [...prev, newSample]);
  };

  return (
    <div className="smartlab">
      <div className="smartlab__content">
        <section className="smartlab__left">
          <div className="smartlab__panel smartlab__main-panel">
            <header className="smartlab__header">
              <div className="smartlab__header-left">
                <h1 className="smartlab__title">
                  <i className="smartlab__title-icon fas fa-file-alt" aria-hidden="true"></i>
                  {title}
                </h1>
                <div className="smartlab__subtitle">Таблица результатов испытаний (по сетям)</div>
              </div>
              <div className="smartlab__header-right">
                <button className="smartlab__create" onClick={handleCreateProtocol}>
                  <i className="fas fa-file-medical"></i>
                  Создать протокол
                </button>
              </div>
            </header>

            {samples.map((s, idx) => (
              <article key={s.id} className="smartlab__card">
                <div className="smartlab__card-head">
                  <div className="smartlab__card-num">№ {idx + 1}</div>
                  <div className="smartlab__chip">{s.name}</div>
                  <div className="smartlab__gost">ГОСТ P 58401.1-2019</div>
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

                <div className="smartlab__row smartlab__row--3">
                  <div className="smartlab__field">
                    <div className="smartlab__label">1-е взвешивание</div>
                    <div className="smartlab__measure">
                      <div className="smartlab__input smartlab__input--short">—</div>
                      <span className="smartlab__unit">г</span>
                    </div>
                  </div>
                  <div className="smartlab__field">
                    <div className="smartlab__label">2-е взвешивание</div>
                    <div className="smartlab__measure">
                      <div className="smartlab__input smartlab__input--short">—</div>
                      <span className="smartlab__unit">г</span>
                    </div>
                  </div>
                  <div className="smartlab__field">
                    <div className="smartlab__label">Средняя масса</div>
                    <div className="smartlab__measure">
                      <div className="smartlab__input smartlab__input--short">—</div>
                      <span className="smartlab__unit">г</span>
                    </div>
                  </div>
                </div>

                <div className="smartlab__grid smartlab__grid--notes">
                  <div className="smartlab__field">
                    <div className="smartlab__label">Примечания</div>
                    <div className="smartlab__input">Без замечаний</div>
                  </div>
                </div>
              </article>
            ))}

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
              <li className="is-done">
                <span className="step-circle step-circle--done" aria-hidden="true">✓</span>
                Приветствие / распознавание
              </li>
              <li className="is-active">
                <span className="step-circle" aria-hidden="true">2</span>
                <strong>Возьмите образец № 6</strong>
              </li>
              <li>
                <span className="step-circle" aria-hidden="true">3</span>
                Перенесите на весы
              </li>
              <li>
                <span className="step-circle" aria-hidden="true">4</span>
                Назовите массу и подтвердите
              </li>
              <li>
                <span className="step-circle" aria-hidden="true">5</span>
                Следующий образец № 8 / завершение
              </li>
            </ol>
          </div>

          <div className="smartlab__panel">
            <div className="smartlab__panel-title">Текущий шаг: Возьмите образец № 6</div>
            <div className="smartlab__panel-subtitle">Ожидаю действие оператора</div>
            <div className="smartlab__tags">
              <span className="tag tag--ok">
                <i className="tag__icon fas fa-user" aria-hidden="true"></i>
                Лицо (распознано)
              </span>
              <span className="tag tag--ok">
                <i className="tag__icon fas fa-balance-scale" aria-hidden="true"></i>
                Весы (подключено)
              </span>
              <span className="tag tag--ok">
                <i className="tag__icon fas fa-microphone" aria-hidden="true"></i>
                Микрофон (активен)
              </span>
            </div>
          </div>

          <div className="smartlab__panel">
            <div className="smartlab__panel-title">Прогресс образцов</div>
            <div className="smartlab__progress-text">{`Обработано 0/${samples.length}`}</div>
            <div className="smartlab__progress">
              <div className="smartlab__progress-bar" style={{ width: '0%' }} />
            </div>
            <div className="smartlab__sample-buttons">
              {samples.map((s) => (
                <button
                  key={s.id}
                  className={`smartlab__sample-btn ${s.id === 6 ? 'is-active' : ''}`}
                  title={`Образец ${s.id}`}
                >
                  {s.id}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

SmartLabSection.propTypes = {
  activeSubItem: PropTypes.string,
};

export default SmartLabSection;


