import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("🌱 جاري تحديث قاعدة البيانات (مع تثبيت الـ IDs)...");
  
  // 1. تنظيف البيانات القديمة بالترتيب لتجنب أخطاء العلاقات
  await prisma.attendance.deleteMany({});
  await prisma.lecture.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.user.deleteMany({});

  // ==========================================
  // 2. إضافة المواد الدراسية
  // ==========================================
  const subjects = [
    // --- تيرم 6 ---
    { name: "تصميم المحتوى الإلكتروني", code: "413612", term: "6", hasSection: true, hasLecture: true },
    { name: "إنتاج المواقع الإلكترونية للأطفال", code: "433611", term: "6", hasSection: true, hasLecture: true },
    { name: "تربية القوام", code: "433612", term: "6", hasSection: true, hasLecture: true },
    { name: "تدريب ميداني 2", code: "413614", term: "6", hasSection: true, hasLecture: false }, // عملي فقط
    { name: "التكنولوجيا المساندة لذوي الاحتياجات", code: "413613", term: "6", hasSection: false, hasLecture: true },
    { name: "مقدمة في التربية الخاصة", code: "423611", term: "6", hasSection: false, hasLecture: true },
    { name: "الفروق الفردية للأطفال", code: "423612", term: "6", hasSection: false, hasLecture: true },
    { name: "مقرر اختياري (علوم تربوية)", code: "ELECTIVE_6", term: "6", hasSection: false, hasLecture: true, isElective: true },

    // --- تيرم 7 ---
    { name: "تصميم وتوظيف بيئات التعلم الذكية", code: "414715", term: "7", hasSection: true, hasLecture: true },
    { name: "التعلم الإلكتروني وتطبيقات الويب", code: "414716", term: "7", hasSection: true, hasLecture: true },
    { name: "صعوبات التعلم للأطفال", code: "424713", term: "7", hasSection: true, hasLecture: true },
    { name: "إنتاج تطبيقات الهواتف المحمولة", code: "434713", term: "7", hasSection: true, hasLecture: true },
    { name: "الوسائط الثقافية للأطفال", code: "434714", term: "7", hasSection: true, hasLecture: true },
    { name: "تدريب ميداني 3", code: "414717", term: "7", hasSection: true, hasLecture: false }, // عملي فقط
    { name: "الصحة النفسية وتوافق الطفل", code: "424714", term: "7", hasSection: false, hasLecture: true },
    { name: "مقرر اختياري (علوم نفسية)", code: "ELECTIVE_7", term: "7", hasSection: false, hasLecture: true, isElective: true },

    // --- تيرم 8 ---
    { name: "التنمية المهنية المستدامة", code: "414819", term: "8", hasSection: true, hasLecture: true },
    { name: "مهارات التواصل لذوي الاحتياجات", code: "424816", term: "8", hasSection: true, hasLecture: true },
    { name: "متحف ومكتبة الطفل", code: "434815", term: "8", hasSection: true, hasLecture: true },
    { name: "تدريب ميداني 4", code: "414820", term: "8", hasSection: true, hasLecture: false }, // عملي فقط
    { name: "التقويم التربوي الإلكتروني", code: "414818", term: "8", hasSection: false, hasLecture: true },
    { name: "الاكتشاف والتدخل المبكر", code: "424815", term: "8", hasSection: false, hasLecture: true },
    { name: "قراءات باللغة الأجنبية", code: "434816", term: "8", hasSection: false, hasLecture: true },
    { name: "مقرر اختياري (علوم نفسية)", code: "ELECTIVE_8", term: "8", hasSection: false, hasLecture: true, isElective: true },
  ];

  for (const subject of subjects) {
    await prisma.subject.create({
      data: subject
    });
  }

  // ==========================================
  // 3. إضافة الطلاب (مع تثبيت IDs)
  // ==========================================
  const students = [
    { 
      id: "student-ahmed-fixed-id", // 🔥 ID ثابت لأحمد
      name: "أحمد محمد علي", 
      email: "student1@test.com", 
      password: "123", 
      division: "1", 
      classNumber: "1" 
    },
    { 
      id: "student-sara-fixed-id", // 🔥 ID ثابت لسارة
      name: "سارة محمود", 
      email: "student2@test.com", 
      password: "123", 
      division: "1", 
      classNumber: "2" 
    }
  ];

  for (const student of students) {
    await prisma.user.create({
      data: { 
        id: student.id, 
        name: student.name,
        email: student.email,
        password: student.password,
        division: student.division,
        classNumber: student.classNumber,
        role: "STUDENT" 
      }
    });
  }

  console.log('✅ تم التحديث بنجاح! الطلاب الآن لديهم IDs ثابتة.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });