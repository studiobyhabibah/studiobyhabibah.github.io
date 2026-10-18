# موقع Habibah - دليل سريع (عامية)

## الفكرة
- الموقع static على GitHub Pages (مجاني). صفحة الأدمن في /admin/ (Sveltia CMS) بتفتحها من الايفون، تدخل بتوكن GitHub، تضيف وتعدل وترتب وتمسح مشاريع وترفع صور. كل Save بيتسجل في GitHub والموقع بيتحدث لوحده بعد دقيقة أو اتنين.
- الداتا والصور محفوظة في GitHub، يعني مش بتضيع لما تقفلي المتصفح أو تعملي logout.

## الحدود (بصراحة)
- GitHub Pages المجاني محتاج repo عام (Public). الصور والداتا ظاهرة للكل أصلا لأنها موقعك.
- حجم الموقع لحد 1 GB، والـ repo يفضل ميزيدش عن 1 GB، وتقريبا 100 GB نقل بيانات في الشهر (حدود soft). صور الايفون الكبيرة بتاكل مساحة: صغّريها قبل الرفع (حوالي 1 MB للصورة كفاية).
- كل Save = تحديث. لو عملتي Saves كتير ورا بعض ممكن يتأخر النشر (soft limit 10 builds في الساعة).
- Sveltia CMS مشروع شخصي لمطور واحد، وصفحة الأدمن بتحمله من unpkg. لو وقف، موقعك العام يفضل شغال، وتقدري تعدلي data/projects.json من github.com مباشرة.
- مفيش حاجة اتجربت على جهاز حقيقي. جربي كل خطوة بالترتيب.

## النشر (مرة واحدة)
1. اعملي حساب GitHub مجاني.
2. New repository، اسمه مثلا portfolio، خليه Public.
3. Add file > Upload files، ارفعي محتوى فولدر الموقع كله (لازم الفولدرات admin و css و js و data و images و ملف index.html).
4. Settings > Pages > Source: Deploy from a branch، Branch: main، Folder: /root، Save.
5. بعد دقيقتين الموقع هيكون على https://اسمك.github.io/portfolio/ (متأكدي إنه اشتغل قبل ما تعتبريه منشور).
6. افتحي admin/config.yml على GitHub واعملي Edit، غيّري سطر repo لـ اسمك/portfolio، واعملي Commit.

## التوكن (آمن)
1. GitHub > Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate.
2. Repository access: Only select repositories، اختاري الـ portfolio بس.
3. Permissions > Repository > Contents: Read and write.
4. انسخي التوكن واحفظيه في مكان خاص (Passwords أو Keychain). هو أصلا مش موجود في الموقع. لو انتهى، اعملي توكن جديد.
5. افتحي https://اسمك.github.io/portfolio/admin/ وسجلي بالتوكن.

## الاستخدام من الايفون
- Projects: Add Project لإضافة، اسحبي العنصر للترتيب، سلة المهملات للمسح.
- Images: ضيفي صور كتير للمشروع الواحد. أول صورة هي الغلاف.
- Show on home page: بتظهر في Selected work. لو مفيش واحد متعلم، بيظهر أول 3.
- Site settings: التاجلاين، الايميل (غيّري your-email@example.com)، اللينكات، التصنيفات، نص About.
- لو غيرتي اسم تصنيف، غيري تصنيف المشاريع القديمة كمان.
- اضغطي Save/Publish، واستني دقيقة أو اتنين.

## ألوان وتعديلات
- الألوان: أول سطر في css/style.css (:root).
- من غير أدمن: عدلي data/projects.json و data/site.json من github.com، وارفعي الصور في images/uploads.

## باك أب
- على الكمبيوتر: Code > Download ZIP من صفحة الـ repo (كل شهر مثلا). أي ZIP تقدري ترفعيه على Cloudflare Pages أو Netlify أو Codeberg Pages من غير تعديل.

## تشيك لست
- الايفون (Safari): الموقع يفتح بدون سكرول أفقي، الفلاتر شغالة، الصورة تتكبر وتتقفل، لينك Behance والايميل شغالين.
- الأدمن: سجلتي، أضفتي مشروع بصورتين، عملتي Save، ظهر في الموقع بعد دقايق، رتبتيه، وبعدين مسحتيه.
- الكمبيوتر: كل الصفحات والفلاتر، وجربي نافذة ضيقة.
- Safari ممكن يمسح التوكن بعد فترة من عدم الاستخدام، فاحتفظي بنسخة منه.
