# Sadeleştirme çalışması — 17 Ağustos 2026

"Arkadaşlarıma kurup anlattığımda karışık geliyor" geri bildiriminden çıkan
kullanılabilirlik değerlendirmesinin Lunara ayağı. Değerlendirme iki uygulamayı
birlikte kapsadı; Womentum'daki karşılığı için oradaki `SADELESTIRME-LOG.md`.

Yöntem: 375 px genişlikte, boş kayıtla, sıfırdan kurulum yapılarak gezildi.
Ekran başına kart/buton/kelime sayıları canlı DOM'dan sayıldı.

---

## Yapılanlar

### 01 · Mobil navigasyon evreye bağlandı — `src/mobile.jsx`

**Sorun.** Alt bardaki dört sekme ve "Daha" menüsü `TABS` / `MORE_ITEMS`
sabitlerinde elle yazılmıştı; evreye göre bölüm seçen `navItemsFor(stage)`
yalnızca masaüstü yan menüde kullanılıyordu. Lunara'nın yedi evresi olmasına
rağmen telefonda hepsi aynı dokuz bölümü görüyordu. Döngü takibi evresinin
tanımlı bölümü beş tane; telefonda dokuz görünüyordu — Dozlar ve Tahliller
dahil, hiç ilgisi olmadığı hâlde.

**Yapılan.** Bar `navItemsFor(stage)` çıktısından türüyor. `MOBILE_PRIORITY`
sırası bara günlük dokunulan bölümleri çıkarıyor. Profil hiçbir evrenin
listesinde değil ama her zaman "Daha" içinde.

| Evre | Bar (önce) | Bar (sonra) |
|---|---|---|
| Döngü takibi | Bugün · Dozlar · Döngü · Hareket | Bugün · Belirtiler · Döngü · Hareket |
| Hazırlık (TTC) | Bugün · Dozlar · Döngü · Hareket | Bugün · Belirtiler · Döngü · Hareket |
| Gebelik | Bugün · Dozlar · Döngü · Hareket | Bugün · Belirtiler · Hareket · Beslenme |
| Doğum sonrası | Bugün · Dozlar · Döngü · Hareket | Bugün · Belirtiler · Hareket · Beslenme |
| Menopoz | Bugün · Dozlar · Döngü · Hareket | Bugün · Belirtiler · Dozlar · Hareket |

Gebe bir kullanıcı artık Döngü takvimi sekmesi görmüyor; döngü takibi yapan
biri Dozlar ve Tahliller görmüyor.

**Test.** `src/mobile-nav.test.js` — 8 test, yedi evrenin tamamı üzerinde.

---

### 02 · Veri yokken faz uydurma bitirildi — `src/shared.jsx`, `src/screens.jsx`

**Sorun.** Kurulumda evre seçilip geçildiğinde `periodStart` sessizce bugüne
düşüyordu ve uygulama "döngünün 1. günündesin — menstrüel fazı" diyor, ayı
fazlara boyuyor, beş günü "beklenen kanama" işaretliyordu.

**Yapılan.** Çapa yoksa `periodStart` **null** kalıyor; `cycleDayFrom` ve
`phaseOf` null dönüyor. `hasCycleAnchor(lunara)` eklendi. Çapa yokken takvim
boyanmıyor, halkalarda işaretçi yok, `ReferenceCard` çizilmiyor, Bugün ekranı
tek iş gösteriyor: son reglinin ilk gününü işaretle.

**Lunara'ya özel iki ekran.** Womentum'da olmayan iki yer daha vardı:

- **Hazırlık (TTC).** `ttcStatus(null)` korumasızken `toOv = ov - null = ov`
  çıkıyor ve uygulama *"Ovülasyon 14 gün içinde bekleniyor"* gibi tamamen
  uydurma bir tahmin veriyordu. Artık `unknown` bayrağı taşıyor; başlık
  "Önce döngünü kuralım" oluyor, zirve günü satırı ve doğurganlık halkasının
  işaretçisi gizleniyor.
- **İlk dönemler (menarş).** `MENARCHE_PHASES[ph.key]` faz null olduğunda
  doğrudan çöküyordu. Faz yokken anlatı yerine ilk adım gösteriliyor.

**Yol üstünde çıkan hata.** `bleedExpected(null, 28)` → `null <= 5` → `true`.
Fonksiyonun kendisi yalan söylüyordu; test yazarken yakalandı.

**Test.** `src/cycle-unset.test.js` — 6 test.

---

### 04 · İlk ekrandaki dört sıfır kaldırıldı — `src/editorial.jsx`

Yeni kurulmuş uygulamada Bugün ekranı `0 / 0 / 0 / 0` sayaçlarıyla bitiyordu.
Hiç kayıt yokken sayaç kartı yerine tek adımlık başlangıç kartı geliyor.

---

### 06 · Referans ekranları katlandı — `src/nourish.jsx`

Faz rehberi `ReferansBolum` içine alındı: tek satırlık "bugünün önerisi"
görünür kalıyor, gerisi "Tüm faz rehberini gör" ile açılıyor.

| Ekran | Önce | Sonra (kapalı) |
|---|---|---|
| Beslenme (döngü evresi) | 4 kart / 201 kelime | 1 kart / 54 kelime |

Evreye özel içerik gösteren evrelerde (gebelik, TTC, doğum sonrası) ekran zaten
erken dönüyor; oralarda değişiklik yok.

---

## Değiştirilmeyenler (kasıtlı)

- **Kurulum ekranı.** Lunara'nın yedi evreli tek soruluk kurulumu zaten iyi
  çalışıyor — değerlendirmede "doğru yaklaşım" olarak işaretlendi. Sorun
  Womentum'un altı alanlı formundaydı, o düzeltildi.
- **Faz renkleri.** Womentum pastelleştirildi, Lunara'da doygun sürüm kaldı
  (talep üzerine).
- **Takvimdeki beklenen / gerçekleşen kanama ayrımı** ve **faz renginin
  yanındaki yazılı etiket** — ikisi de korundu; renk körlüğünde faz ayrımı
  ΔE 6.9 ile sınırda, etiket kaldırılırsa renk tek başına yetmiyor.

---

## Doğrulama

- **120 test** geçiyor (10 dosya).
- Temiz derleniyor; service worker üretiliyor (`precache 27 entries`).
- Yedi evrenin tamamında mobil bar doğru bölümleri gösteriyor, konsolda hata yok.

## Commit'ler

```
2701b56  ReferenceCard'daki koşullu hook çağrısını düzelt
913faa8  Boş durumu dürüst yap ve referans ekranlarını hafiflet
effd8c3  Mobil navigasyonu evreye bağla
```
