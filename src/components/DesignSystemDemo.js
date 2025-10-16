import React, { useState } from 'react';
import { Button, Input } from './ui';

const DesignSystemDemo = () => {
  const [inputValue, setInputValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [errorValue, setErrorValue] = useState('');

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1>GrowPath Design System</h1>
      <p className="text-large mb-6">
        Демонстрация базовых компонентов дизайн-системы
      </p>

      <section className="mb-8">
        <h2>Кнопки</h2>
        <div className="flex gap-4 mb-4">
          <Button variant="primary" size="small">Сохранить</Button>
          <Button variant="primary" size="medium">Войти</Button>
          <Button variant="primary" size="large">Большая кнопка</Button>
        </div>
        
        <div className="flex gap-4 mb-4">
          <Button variant="secondary">Вторичная</Button>
          <Button variant="outline">Контурная</Button>
          <Button variant="success">Успех</Button>
          <Button variant="danger">Опасность</Button>
        </div>
        
        <div className="flex gap-4 mb-4">
          <Button variant="primary" disabled>Отключена</Button>
          <Button variant="primary" className="btn--loading">Загрузка</Button>
        </div>
        
        <Button variant="primary" className="btn--full-width mb-4">
          Полная ширина
        </Button>
      </section>

      <section className="mb-8">
        <h2>Поля ввода</h2>
        
        <div className="mb-4">
          <Input
            label="Имя"
            placeholder="Введите ваше имя"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <Input
            type="email"
            label="E-mail"
            placeholder="example@email.com"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            icon="📧"
            required
          />
        </div>
        
        <div className="mb-4">
          <Input
            type="password"
            label="Пароль"
            placeholder="Введите пароль"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            showPasswordToggle
            required
          />
        </div>
        
        <div className="mb-4">
          <Input
            label="Поиск стажера"
            placeholder="Искать стажера"
            icon="🔍"
            iconPosition="left"
          />
        </div>
        
        <div className="mb-4">
          <Input
            label="Выберите департамент"
            placeholder="Выберите департамент"
            icon="▼"
            iconPosition="right"
            className="input--select"
          />
        </div>
        
        <div className="mb-4">
          <Input
            label="Поле с ошибкой"
            placeholder="Должен включать минимум 8 символов"
            value={errorValue}
            onChange={(e) => setErrorValue(e.target.value)}
            error="Должен включать минимум 8 символов"
          />
        </div>
        
        <div className="mb-4">
          <Input
            label="Отключенное поле"
            placeholder="Это поле отключено"
            disabled
          />
        </div>
      </section>

      <section className="mb-8">
        <h2>Типографика</h2>
        
        <div className="mb-4">
          <h1>Заголовок H1 - Montserrat 30px Bold</h1>
          <h2>Заголовок H2 - Montserrat 24px Bold</h2>
          <h3>Заголовок H3 - Montserrat 20px Semibold</h3>
          <h4>Заголовок H4 - Montserrat 18px Semibold</h4>
          <h5>Заголовок H5 - Montserrat 16px Semibold</h5>
          <h6>Заголовок H6 - Montserrat 14px Semibold</h6>
        </div>
        
        <div className="mb-4">
          <p className="text-large">Большой текст - Source Sans Pro 18px</p>
          <p className="text-base">Основной текст - Source Sans Pro 16px</p>
          <p className="text-small">Малый текст - Source Sans Pro 14px</p>
          <p className="text-xs">Очень малый текст - Source Sans Pro 12px</p>
        </div>
        
        <div className="mb-4">
          <p className="font-normal">Обычный вес шрифта</p>
          <p className="font-semibold">Полужирный вес шрифта</p>
          <p className="font-bold">Жирный вес шрифта</p>
        </div>
      </section>

      <section className="mb-8">
        <h2>Цветовая палитра</h2>
        
        <div className="flex gap-4 mb-4">
          <div className="p-4 rounded-md" style={{ backgroundColor: '#1A7AE0', color: 'white' }}>
            Primary Blue<br/>#1A7AE0
          </div>
          <div className="p-4 rounded-md" style={{ backgroundColor: '#92C0FA', color: '#212121' }}>
            Light Blue<br/>#92C0FA
          </div>
          <div className="p-4 rounded-md" style={{ backgroundColor: '#31F0A4', color: '#212121' }}>
            Bright Green<br/>#31F0A4
          </div>
          <div className="p-4 rounded-md" style={{ backgroundColor: '#99E6D8', color: '#212121' }}>
            Light Green<br/>#99E6D8
          </div>
        </div>
        
        <div className="flex gap-4 mb-4">
          <div className="p-4 rounded-md" style={{ backgroundColor: '#F6F7F9', color: '#212121', border: '1px solid #E0E0E0' }}>
            Off-white<br/>#F6F7F9
          </div>
          <div className="p-4 rounded-md" style={{ backgroundColor: '#212121', color: 'white' }}>
            Dark Gray<br/>#212121
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2>Цвета рейтингов</h2>
        
        <div className="flex gap-4 mb-4">
          <div className="p-4 rounded-md" style={{ backgroundColor: '#31F0A4', color: '#212121' }}>
            Высокий рейтинг<br/>9.0
          </div>
          <div className="p-4 rounded-md" style={{ backgroundColor: '#FFC107', color: '#212121' }}>
            Средний рейтинг<br/>7.6
          </div>
          <div className="p-4 rounded-md" style={{ backgroundColor: '#FF5252', color: 'white' }}>
            Низкий рейтинг<br/>5.6
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2>Цвета опыта</h2>
        
        <div className="flex gap-4 mb-4">
          <div className="p-4 rounded-md" style={{ backgroundColor: '#92C0FA', color: '#212121' }}>
            Начинающий<br/>2 мес
          </div>
          <div className="p-4 rounded-md" style={{ backgroundColor: '#FF9800', color: 'white' }}>
            Средний<br/>5 мес
          </div>
          <div className="p-4 rounded-md" style={{ backgroundColor: '#31F0A4', color: '#212121' }}>
            Продвинутый<br/>3 мес
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignSystemDemo;
