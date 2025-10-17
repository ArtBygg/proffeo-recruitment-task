# Zadanie Rekrutacyjne – Etap 1

### Nie oczekujemy gotowego produktu - zrób tyle ile będziesz w stanie zrobić. Otrzymanie zadania oznacza start zadania i od niego liczone jest do 8h. (Zadanie w najprostszym wariancie powinno zająć około 3-4 godziny)

### Dla jasności - żaden fragment zadania nie zostanie wykorzystany komercyjnie, jest to zadanie czysto rekrutacyjne.

## Cel

Twoim zadaniem jest przygotowanie mini-aplikacji w Angular 20 z wykorzystaniem nowoczesnych funkcjonalności frameworka.

Aplikacja powinna korzystać z publicznego API [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com), prezentować listę postów wraz z możliwością ich filtrowania, przeglądania szczegółów oraz dodawania do ulubionych.  
Projekt ma być responsywny i działać zarówno na desktopie, jak i na urządzeniach mobilnych.

---

## Zasady realizacji
- Zadanie należy umieścić w publicznym repozytorium GitHub, aby był wgląd w historię commitów.
- **Nazwa repozytorium:** imię i nazwisko kandydata.
- **Czas na wykonanie:** do 8 godzin.
- **Commity:** częste i opisowe.
- Kod powinien być zgodny z dobrymi praktykami (DRY, SOLID, czystość architektury).

---

## Wymagania techniczne

- **Framework:** Angular 20  
- **Komponenty:** Standalone Components  
- **Stan:** signals  
- **Change detection:** zoneless (`provideZonelessChangeDetection()`)  
- **Style:** TailwindCSS v4 (theme, zmienne, flexbox)  
- **Architektura:** lazy loading modułów/feature’ów  
- **Stan aplikacji:** signals + prosty singleton service trzymający dane w pamięci (cache)  
- **Struktura katalogów:** przejrzysta i uporządkowana (np. `features/`, `shared/`, `core/`, `services/`)  

---

## Funkcjonalności

### 1. Lista postów
- Pobranie listy z API:  
  `https://jsonplaceholder.typicode.com/posts`  
- Wyświetlenie listy tytułów i fragmentów treści.  

### 2. Szczegóły posta
Po kliknięciu w post załaduj i wyświetl:  
- pełną treść posta,  
- dane autora (`/users/:id`),  
- komentarze (`/posts/:id/comments`).  

### 3. Filtrowanie
- **Po treści posta** – filtracja po stronie frontendu.  
- **Po użytkowniku** – filtrowanie przez query param:  
  `https://jsonplaceholder.typicode.com/posts?userId=1`  
- **Tylko ulubione** – filtrowanie postów oznaczonych jako ulubione (stan w singletonie).  

### 4. Ulubione
- Możliwość oznaczania posta jako ulubiony (toggle).  
- Lista ulubionych przechowywana w singletonie (stan w serwisie).  

### 5. Singleton (cache)
Dane postów muszą być przechowywane w singleton service (signal store).  
Dzięki temu posty nie są pobierane ponownie przy każdym wejściu.  

Ponowne zapytania do API wykonujemy tylko w przypadku:  
- zmiany filtrów,  
- odświeżenia strony.  

--

## Podsumowanie
Aplikacja powinna:  
- pobierać i wyświetlać posty,  
- umożliwiać filtrowanie,  
- prezentować szczegóły posta,  
- obsługiwać ulubione,  
- być responsywna i nowoczesna,  
- korzystać z najnowszych funkcjonalności Angulara 20.  
