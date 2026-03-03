import { PrismaClient, Role } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("🌱 جاري تهيئة النظام (بياناتك + سيناريو 2 حضور و 1 غياب)...");
  
  // 1. تنظيف البيانات القديمة
  await prisma.attendance.deleteMany({});
  await prisma.lecture.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.user.deleteMany({});

  // ==========================================
  // 2. إضافة المواد الدراسية (كما هي في كودك)
  // ==========================================
  const subjectsData = [
    // ---------------- تيرم 6 ----------------
    { name: "تصميم المحتوى الإلكتروني", code: "413612", term: "6", hasSection: true, hasLecture: true },
    { name: "التكنولوجيا المساندة لذوي الاحتياجات الخاصة", code: "413613", term: "6", hasSection: true, hasLecture: true }, 
    { name: "تدريب ميداني 2", code: "413614", term: "6", hasSection: true, hasLecture: false },
    { name: "مقدمة في التربية الخاصة", code: "423611", term: "6", hasSection: false, hasLecture: true },
    { name: "الفروق الفردية للأطفال", code: "423612", term: "6", hasSection: false, hasLecture: true },
    { name: "إنتاج المواقع الإلكترونية للأطفال", code: "433611", term: "6", hasSection: true, hasLecture: true },
    { name: "تربية القوام", code: "433612", term: "6", hasSection: true, hasLecture: true },
    { name: "مقرر اختياري (علوم تربوية)", code: "ELECTIVE_6", term: "6", hasSection: false, hasLecture: true, isElective: true },

    // ---------------- تيرم 7 ----------------
    { name: "تصميم وتوظيف بيئات التعلم الذكية", code: "414715", term: "7", hasSection: true, hasLecture: true },
    { name: "التعلم الإلكتروني وتطبيقات الويب النقال", code: "414716", term: "7", hasSection: true, hasLecture: true },
    { name: "تدريب ميداني 3", code: "414717", term: "7", hasSection: true, hasLecture: false },
    { name: "صعوبات التعلم للأطفال", code: "424713", term: "7", hasSection: true, hasLecture: true },
    { name: "الصحة النفسية وتوافق الطفل", code: "424714", term: "7", hasSection: false, hasLecture: true },
    { name: "إنتاج تطبيقات الهواتف المحمولة", code: "434713", term: "7", hasSection: true, hasLecture: true },
    { name: "الوسائط الثقافية للأطفال", code: "434714", term: "7", hasSection: true, hasLecture: true },
    { name: "مقرر اختياري (علوم نفسية)", code: "ELECTIVE_7", term: "7", hasSection: false, hasLecture: true, isElective: true },

    // ---------------- تيرم 8 ----------------
    { name: "التقويم التربوي الإلكتروني", code: "414818", term: "8", hasSection: true, hasLecture: true },
    { name: "التنمية المهنية المستدامة", code: "414819", term: "8", hasSection: true, hasLecture: true },
    { name: "تدريب ميداني 4", code: "414820", term: "8", hasSection: true, hasLecture: false },
    { name: "الاكتشاف والتدخل المبكر لذوي الاحتياجات الخاصة", code: "424815", term: "8", hasSection: false, hasLecture: true },
    { name: "مهارات التواصل لذوي الاحتياجات الخاصة", code: "424816", term: "8", hasSection: true, hasLecture: true },
    { name: "متحف ومكتبة الطفل", code: "434815", term: "8", hasSection: true, hasLecture: true },
    { name: "قراءات باللغة الأجنبية", code: "434816", term: "8", hasSection: false, hasLecture: true },
    { name: "مقرر اختياري (علوم نفسية)", code: "ELECTIVE_8", term: "8", hasSection: false, hasLecture: true, isElective: true },
  ];

  // حفظ المواد لاستخدامها لاحقاً
  const createdSubjects = [];
  for (const subject of subjectsData) {
    const s = await prisma.subject.create({ data: subject });
    createdSubjects.push(s);
  }

  // ==========================================
  // 3. إضافة المستخدمين (ببياناتك الخاصة)
  // ==========================================
  
  // المسؤول
  await prisma.user.create({
    data: {
      id: "admin-user",
      name: "مسؤول النظام",
      email: "mo879938@gmail.com",
      password: "0100adminmo@g",
      role: Role.ADMIN 
    }
  });

  // الطالب
  const student = await prisma.user.create({
    data: {
      id: "student-1",
      name: "أحمد مختار",
      email: "mo@gmail.com",
      password: "0100ahmed",
      division: "1",
      classNumber: "1",
      role: Role.STUDENT 
    }
  });

  // ========================================================
  // 4. سيناريو الاختبار (2 حضور - 1 غياب - 1 غياب اليوم)
  // ========================================================
  
  // سنطبق السيناريو على مادة "تدريب ميداني 2" (Term 6)
  const targetSubject = createdSubjects.find(s => s.name === "تدريب ميداني 2");

  if (targetSubject) {
      const day1 = new Date(); day1.setDate(day1.getDate() - 10); // فات من 10 أيام
      const day2 = new Date(); day2.setDate(day2.getDate() - 7);  // فات من 7 أيام
      const day3 = new Date(); day3.setDate(day3.getDate() - 3);  // فات من 3 أيام
      
      // محاضرة اليوم (فاتت من ساعتين) -> ستظهر غياب بالأحمر حتى تمسح الكود
      const todayPast = new Date(); todayPast.setHours(todayPast.getHours() - 2);

      // 1. محاضرة (حضور)
      const lec1 = await prisma.lecture.create({ 
          data: { topic: "مقدمة التدريب", type: "PHYSICAL", date: day1, subjectId: targetSubject.id } 
      });
      await prisma.attendance.create({ 
          data: { userId: student.id, lectureId: lec1.id, status: "PRESENT" } 
      });

      // 2. محاضرة (حضور)
      const lec2 = await prisma.lecture.create({ 
          data: { topic: "مهارات التواصل", type: "PHYSICAL", date: day2, subjectId: targetSubject.id } 
      });
      await prisma.attendance.create({ 
          data: { userId: student.id, lectureId: lec2.id, status: "PRESENT" } 
      });

      // 3. محاضرة (غياب قديم) - لن ننشئ لها سجل حضور
      await prisma.lecture.create({ 
          data: { topic: "كتابة التقارير", type: "PHYSICAL", date: day3, subjectId: targetSubject.id } 
      });

      // 4. محاضرة اليوم (غياب حالي) - بكود 123
      await prisma.lecture.create({ 
          data: { 
              topic: "محاضرة اليوم (تظهر غياب)", 
              type: "PHYSICAL", 
              date: todayPast, 
              subjectId: targetSubject.id, 
              qrCode: "123" 
          } 
      });
  }

  console.log(`✅ تم تجهيز البيانات:`);
  console.log(`- المواد: ${subjectsData.length}`);
  console.log(`- الطالب: mo@gmail.com`);
  console.log(`- السيناريو: مادة "تدريب ميداني 2" بها 2 حضور، 1 غياب قديم، 1 غياب اليوم (بكود 123).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });