import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("🌱 جاري تحديث قاعدة البيانات (المواد من الجداول + 150 طالب)...");
  
  // 1. تنظيف البيانات القديمة
  await prisma.attendance.deleteMany({});
  await prisma.lecture.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.user.deleteMany({});

  // ==========================================
  // 2. إضافة المواد الدراسية (طبقاً للصور المرفقة)
  // ==========================================
  const subjects = [
    // ---------------- تيرم 6 (المستوى الثالث) ----------------
    { 
      name: "تصميم المحتوى الإلكتروني", 
      code: "413612", term: "6", hasSection: true, hasLecture: true 
    },
    { 
      name: "التكنولوجيا المساندة لذوي الاحتياجات الخاصة", 
      code: "413613", term: "6", hasSection: true, hasLecture: true // (1 نظري + 2 تطبيقي)
    }, 
    { 
      name: "تدريب ميداني 2", 
      code: "413614", term: "6", hasSection: true, hasLecture: false // (0 نظري + 6 تطبيقي)
    },
    { 
      name: "مقدمة في التربية الخاصة", 
      code: "423611", term: "6", hasSection: false, hasLecture: true // (2 نظري + 0 تطبيقي)
    },
    { 
      name: "الفروق الفردية للأطفال", 
      code: "423612", term: "6", hasSection: false, hasLecture: true // (2 نظري + 0 تطبيقي)
    },
    { 
      name: "إنتاج المواقع الإلكترونية للأطفال", 
      code: "433611", term: "6", hasSection: true, hasLecture: true 
    },
    { 
      name: "تربية القوام", 
      code: "433612", term: "6", hasSection: true, hasLecture: true // (1 نظري + 2 تطبيقي)
    },
    { 
      name: "مقرر اختياري (علوم تربوية)", 
      code: "ELECTIVE_6", term: "6", hasSection: false, hasLecture: true, isElective: true 
    },

    // ---------------- تيرم 7 (المستوى الرابع) ----------------
    { 
      name: "تصميم وتوظيف بيئات التعلم الذكية", 
      code: "414715", term: "7", hasSection: true, hasLecture: true 
    },
    { 
      name: "التعلم الإلكتروني وتطبيقات الويب النقال", 
      code: "414716", term: "7", hasSection: true, hasLecture: true 
    },
    { 
      name: "تدريب ميداني 3", 
      code: "414717", term: "7", hasSection: true, hasLecture: false // (0 نظري + 6 تطبيقي)
    },
    { 
      name: "صعوبات التعلم للأطفال", 
      code: "424713", term: "7", hasSection: true, hasLecture: true 
    },
    { 
      name: "الصحة النفسية وتوافق الطفل", 
      code: "424714", term: "7", hasSection: false, hasLecture: true // (2 نظري + 0 تطبيقي)
    },
    { 
      name: "إنتاج تطبيقات الهواتف المحمولة", 
      code: "434713", term: "7", hasSection: true, hasLecture: true 
    },
    { 
      name: "الوسائط الثقافية للأطفال", 
      code: "434714", term: "7", hasSection: true, hasLecture: true // (1 نظري + 2 تطبيقي)
    },
    { 
      name: "مقرر اختياري (علوم نفسية)", 
      code: "ELECTIVE_7", term: "7", hasSection: false, hasLecture: true, isElective: true 
    },

    // ---------------- تيرم 8 (المستوى الرابع) ----------------
    { 
      name: "التقويم التربوي الإلكتروني", 
      code: "414818", term: "8", hasSection: true, hasLecture: true // (1 نظري + 2 تطبيقي)
    },
    { 
      name: "التنمية المهنية المستدامة", 
      code: "414819", term: "8", hasSection: true, hasLecture: true 
    },
    { 
      name: "تدريب ميداني 4", 
      code: "414820", term: "8", hasSection: true, hasLecture: false // (0 نظري + 6 تطبيقي)
    },
    { 
      name: "الاكتشاف والتدخل المبكر لذوي الاحتياجات الخاصة", 
      code: "424815", term: "8", hasSection: false, hasLecture: true // (2 نظري + 0 تطبيقي)
    },
    { 
      name: "مهارات التواصل لذوي الاحتياجات الخاصة", 
      code: "424816", term: "8", hasSection: true, hasLecture: true 
    },
    { 
      name: "متحف ومكتبة الطفل", 
      code: "434815", term: "8", hasSection: true, hasLecture: true // (1 نظري + 2 تطبيقي)
    },
    { 
      name: "قراءات باللغة الأجنبية", 
      code: "434816", term: "8", hasSection: false, hasLecture: true // (2 نظري + 0 تطبيقي)
    },
    { 
      name: "مقرر اختياري (علوم نفسية)", 
      code: "ELECTIVE_8", term: "8", hasSection: false, hasLecture: true, isElective: true 
    },
  ];

  // إضافة المواد للداتابيز
  for (const subject of subjects) {
    await prisma.subject.create({ data: subject });
  }

  // ==========================================
  // 3. إضافة مسؤول النظام (Admin)
  // ==========================================
  await prisma.user.create({
    data: {
      id: "admin-user",
      name: "مسؤول النظام",
      email: "admin@test.com",
      password: "123",
      role: "ADMIN"
    }
  });

  // ==========================================
  // 4. توليد 150 طالب (أسماء عربية واقعية)
  // ==========================================
  const students = [];
  const divisions = ["1", "2", "3", "4", "5", "6"]; // الشعب الدراسية
  let studentCounter = 1;

  // توليد الأسماء عشوائياً
  const firstNamesMale = ["محمد", "أحمد", "محمود", "علي", "عمر", "يوسف", "كريم", "خالد", "إبراهيم", "حسن"];
  const firstNamesFemale = ["سارة", "نور", "منى", "ليلى", "فاطمة", "مريم", "هبة", "رنا", "آية", "سلمى"];
  const lastNames = ["عبدالله", "حسن", "إبراهيم", "سعيد", "مصطفى", "كمال", "صلاح", "عادل", "الشريف", "النجار", "علي", "محمود", "سالم"];

  // توزيع 25 طالب في كل شعبة (6 شعب * 25 طالب = 150)
  for (const div of divisions) {
    for (let i = 1; i <= 25; i++) {
      // اختيار الاسم (ولد أو بنت بالتبادل)
      const isMale = i % 2 !== 0;
      const firstName = isMale 
        ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)] 
        : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
      
      const fatherName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const grandFatherName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const familyName = lastNames[Math.floor(Math.random() * lastNames.length)];

      const fullName = `${firstName} ${fatherName} ${grandFatherName} ${familyName}`;

      students.push({
        id: `student-${studentCounter}`, // ID ثابت
        name: fullName,
        email: `student${studentCounter}@test.com`,
        password: "123",
        division: div,
        classNumber: i.toString(), // رقم الكشف (1, 2, 3...)
        role: "STUDENT"
      });
      studentCounter++;
    }
  }

  // حفظ الطلاب في الداتابيز
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

  console.log(`✅ تم إضافة ${subjects.length} مادة دراسية.`);
  console.log(`✅ تم إضافة ${students.length} طالب موزعين على 6 شعب.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });