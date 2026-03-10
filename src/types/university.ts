// Types pour les modules universitaires

export interface AcademicProgram {
  id: string;
  code: string;
  name: string;
  type: 'licence' | 'master' | 'doctorat' | 'diplome';
  department: string;
  faculty: string;
  duration: number;
  totalCredits: number;
  enrolledStudents: number;
  graduationRate: number;
  description: string;
}

export interface Semester {
  id: string;
  number: number;
  courses: CourseRequirement[];
  minCredits: number;
  maxCredits: number;
}

export interface CourseRequirement {
  courseId: string;
  type: 'mandatory' | 'elective' | 'optional';
  credits: number;
  prerequisites: string[];
  corequisites: string[];
}

export interface EnrollmentApplication {
  id: string;
  applicantId: string;
  programId: string;
  academicYear: string;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlist';
  submittedAt?: Date;
  reviewedAt?: Date;
  documents: ApplicationDocument[];
}

export interface ApplicationDocument {
  type: 'transcript' | 'diploma' | 'id' | 'photo' | 'motivation_letter' | 'cv';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  comments?: string;
}

export interface ExamSession {
  id: string;
  type: 'midterm' | 'final' | 'resit' | 'oral' | 'practical';
  courseId: string;
  courseName: string;
  instructor: string;
  date: Date;
  startTime: string;
  duration: number;
  rooms: ExamRoom[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface ExamRoom {
  roomId: string;
  capacity: number;
  assignedStudents: string[];
}

export interface Diploma {
  id: string;
  type: 'licence' | 'master' | 'doctorat' | 'certificate';
  studentId: string;
  studentName: string;
  programId: string;
  programName: string;
  finalGrade: number;
  mention: 'passable' | 'assez_bien' | 'bien' | 'tres_bien' | 'excellent';
  graduationDate: Date;
  issueDate: Date;
  registrationNumber: string;
  qrCode: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  faculty: string;
  head: {
    userId: string;
    startDate: Date;
    endDate?: Date;
  };
  stats: {
    students: number;
    graduates: number;
    faculty: number;
    budget: number;
  };
}

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  type: 'classroom' | 'lab' | 'amphitheater' | 'meeting' | 'study' | 'office';
  capacity: {
    seated: number;
    standing: number;
    exam: number;
  };
  equipment: {
    projector: boolean;
    computer: boolean;
    whiteboard: boolean;
    smartboard: boolean;
    videoConference: boolean;
  };
  status: 'available' | 'maintenance' | 'closed';
}

export interface RoomBooking {
  id: string;
  roomId: string;
  startTime: Date;
  endTime: Date;
  bookedBy: string;
  purpose: string;
  attendees: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface ResearchProject {
  id: string;
  title: string;
  acronym: string;
  domain: string;
  keywords: string[];
  principalInvestigator: string;
  researchers: string[];
  startDate: Date;
  endDate: Date;
  funding: ProjectFunding[];
  publications: string[];
}

export interface ProjectFunding {
  source: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'active' | 'completed';
}

export interface LibraryItem {
  id: string;
  type: 'book' | 'journal' | 'article' | 'thesis' | 'ebook';
  title: string;
  authors: string[];
  publisher: string;
  publicationDate: Date;
  isbn?: string;
  doi?: string;
  subjects: string[];
  copies: LibraryCopy[];
}

export interface LibraryCopy {
  id: string;
  location: string;
  status: 'available' | 'borrowed' | 'reserved' | 'maintenance';
  dueDate?: Date;
}

export interface AlumniProfile {
  id: string;
  userId: string;
  graduationYear: number;
  program: string;
  currentPosition: {
    title: string;
    company: string;
    sector: string;
    location: string;
  };
  mentoring: boolean;
  recruiting: boolean;
}

export interface InternshipOffer {
  id: string;
  company: {
    name: string;
    sector: string;
    location: string;
  };
  title: string;
  description: string;
  duration: number;
  startDate: Date;
  compensation: {
    type: 'paid' | 'unpaid';
    amount?: number;
  };
  status: 'open' | 'closed' | 'filled';
}

export interface ExchangeProgram {
  id: string;
  name: string;
  type: 'erasmus' | 'bilateral' | 'summer' | 'research';
  partnerUniversity: {
    name: string;
    country: string;
    city: string;
  };
  availablePlaces: number;
  duration: string;
}

export interface StudentAssociation {
  id: string;
  name: string;
  acronym: string;
  type: 'cultural' | 'sports' | 'academic' | 'humanitarian' | 'professional';
  members: number;
  president: string;
}

export interface TuitionFee {
  studentId: string;
  academicYear: string;
  total: number;
  balance: number;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  dueDate: Date;
}

export interface CourseEvaluation {
  courseId: string;
  semester: string;
  responseRate: number;
  avgRating: number;
  comments: string[];
}

// Nouveaux types pour modules avancés

export interface AcademicPath {
  id: string;
  studentId: string;
  currentProgram: string;
  currentSemester: number;
  completedCourses: CourseCompletion[];
  plannedCourses: CoursePlanning[];
  recommendations: PathRecommendation[];
  alternativePaths: AlternativePath[];
  progressPercentage: number;
}

export interface CourseCompletion {
  courseId: string;
  courseName: string;
  credits: number;
  grade: number;
  semester: string;
  status: 'passed' | 'failed' | 'in_progress';
}

export interface CoursePlanning {
  courseId: string;
  courseName: string;
  credits: number;
  semester: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PathRecommendation {
  type: 'course' | 'specialization' | 'internship' | 'exchange';
  title: string;
  reason: string;
  priority: number;
}

export interface AlternativePath {
  programId: string;
  programName: string;
  compatibility: number;
  requiredCredits: number;
  transferableCredits: number;
}

export interface TeacherWorkload {
  teacherId: string;
  teacherName: string;
  status: 'MCF' | 'PR' | 'ATER' | 'Vacataire';
  statutoryHours: number;
  courses: TeachingAssignment[];
  totalTDEquivalent: number;
  overload: number;
  researchTime: number;
  administrativeTasks: number;
}

export interface TeachingAssignment {
  courseId: string;
  courseName: string;
  type: 'CM' | 'TD' | 'TP';
  hours: number;
  tdEquivalent: number;
  groups: number;
  semester: string;
}

export interface TimetableSlot {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  startTime: string;
  endTime: string;
  courseId: string;
  courseName: string;
  type: 'CM' | 'TD' | 'TP';
  teacherId: string;
  teacherName: string;
  roomId: string;
  roomName: string;
  groups: string[];
  conflicts: TimetableConflict[];
}

export interface TimetableConflict {
  type: 'room' | 'teacher' | 'student_group';
  severity: 'critical' | 'warning';
  description: string;
}

export interface ContinuousAssessment {
  id: string;
  courseId: string;
  courseName: string;
  type: 'quiz' | 'exercise' | 'project' | 'presentation';
  title: string;
  dueDate: Date;
  maxScore: number;
  weight: number;
  submissions: AssessmentSubmission[];
}

export interface AssessmentSubmission {
  studentId: string;
  studentName: string;
  submittedAt: Date;
  score: number;
  feedback: string;
  status: 'pending' | 'graded' | 'late';
}

export interface SkillsProfile {
  studentId: string;
  studentName: string;
  technicalSkills: Skill[];
  softSkills: Skill[];
  certifications: Certification[];
  projects: ProjectShowcase[];
  endorsements: Endorsement[];
}

export interface Skill {
  name: string;
  category: string;
  level: number;
  acquiredFrom: string[];
  lastUpdated: Date;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId: string;
  verificationUrl?: string;
}

export interface ProjectShowcase {
  title: string;
  description: string;
  technologies: string[];
  role: string;
  startDate: Date;
  endDate?: Date;
  url?: string;
  images: string[];
}

export interface Endorsement {
  skillName: string;
  endorsedBy: string;
  endorsedByRole: string;
  date: Date;
  comment?: string;
}

export interface MentorshipMatch {
  id: string;
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  startDate: Date;
  endDate?: Date;
  focus: string[];
  sessions: MentorshipSession[];
  status: 'active' | 'completed' | 'paused';
}

export interface MentorshipSession {
  date: Date;
  duration: number;
  topics: string[];
  notes: string;
  nextSteps: string[];
}

export interface JuryComposition {
  id: string;
  type: 'exam' | 'defense' | 'deliberation';
  date: Date;
  members: JuryMember[];
  students: string[];
  decisions: JuryDecision[];
}

export interface JuryMember {
  userId: string;
  name: string;
  role: 'president' | 'examiner' | 'supervisor';
  signature?: string;
}

export interface JuryDecision {
  studentId: string;
  studentName: string;
  finalGrade: number;
  mention: 'passable' | 'assez_bien' | 'bien' | 'tres_bien' | 'excellent' | 'ajourne';
  comments: string;
  compensations: string[];
}

export interface AccreditationCriteria {
  id: string;
  organization: 'CTI' | 'HCERES' | 'EUR-ACE' | 'AACSB';
  criterion: string;
  category: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable';
  evidence: Evidence[];
  lastReview: Date;
  nextReview: Date;
}

export interface Evidence {
  type: 'document' | 'data' | 'testimony';
  title: string;
  url?: string;
  description: string;
  uploadedAt: Date;
}

export interface StudentProject {
  id: string;
  type: 'pfe' | 'internship' | 'tutored' | 'research';
  title: string;
  studentId: string;
  studentName: string;
  supervisorId: string;
  supervisorName: string;
  startDate: Date;
  endDate: Date;
  milestones: ProjectMilestone[];
  deliverables: Deliverable[];
  defense?: DefenseInfo;
  finalGrade?: number;
}

export interface ProjectMilestone {
  title: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'overdue';
  completedAt?: Date;
}

export interface Deliverable {
  title: string;
  type: 'report' | 'code' | 'presentation' | 'poster';
  dueDate: Date;
  submittedAt?: Date;
  url?: string;
  grade?: number;
}

export interface DefenseInfo {
  date: Date;
  location: string;
  jury: JuryMember[];
  duration: number;
  presentationUrl?: string;
}

export interface CareerOutcome {
  graduationYear: number;
  programId: string;
  programName: string;
  totalGraduates: number;
  employmentRate: number;
  avgSalary: number;
  sectors: SectorDistribution[];
  positions: PositionDistribution[];
  geographicDistribution: GeographicDistribution[];
}

export interface SectorDistribution {
  sector: string;
  percentage: number;
  avgSalary: number;
}

export interface PositionDistribution {
  position: string;
  percentage: number;
  avgSalary: number;
}

export interface GeographicDistribution {
  region: string;
  percentage: number;
}

export interface Agreement {
  id: string;
  type: 'internship' | 'apprenticeship' | 'partnership' | 'research';
  studentId?: string;
  studentName?: string;
  organization: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'pending_validation' | 'signed' | 'active' | 'completed' | 'cancelled';
  signatories: Signatory[];
  amendments: Amendment[];
  documentUrl?: string;
}

export interface Signatory {
  role: 'student' | 'university' | 'organization' | 'supervisor';
  name: string;
  signedAt?: Date;
  signature?: string;
}

export interface Amendment {
  date: Date;
  description: string;
  documentUrl: string;
}

export interface AccessibilityAccommodation {
  studentId: string;
  studentName: string;
  disability: string;
  accommodations: Accommodation[];
  validFrom: Date;
  validUntil: Date;
  approvedBy: string;
  status: 'active' | 'expired' | 'pending';
}

export interface Accommodation {
  type: 'extra_time' | 'adapted_materials' | 'note_taker' | 'accessible_room' | 'assistive_tech';
  description: string;
  courses: string[];
}

export interface CampusService {
  id: string;
  name: string;
  type: 'restaurant' | 'library' | 'sports' | 'health' | 'housing' | 'it';
  location: string;
  openingHours: OpeningHours[];
  capacity?: number;
  currentOccupancy?: number;
  bookingRequired: boolean;
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
}

export interface ServiceBooking {
  id: string;
  serviceId: string;
  userId: string;
  date: Date;
  startTime: string;
  endTime?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
}

export interface VAEApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  targetDiploma: string;
  professionalExperience: WorkExperience[];
  competencies: CompetencyMapping[];
  status: 'draft' | 'submitted' | 'under_review' | 'interview_scheduled' | 'approved' | 'rejected';
  submittedAt?: Date;
  reviewedAt?: Date;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  skills: string[];
}

export interface CompetencyMapping {
  competency: string;
  targetCourse: string;
  evidence: string[];
  validated: boolean;
}

export interface InnovativePedagogy {
  id: string;
  courseId: string;
  courseName: string;
  method: 'flipped_classroom' | 'pbl' | 'serious_game' | 'vr_ar' | 'peer_instruction';
  description: string;
  resources: PedagogicalResource[];
  effectiveness: EffectivenessMetrics;
}

export interface PedagogicalResource {
  type: 'video' | 'quiz' | 'simulation' | 'game' | 'vr_experience';
  title: string;
  url: string;
  duration?: number;
  completionRate?: number;
}

export interface EffectivenessMetrics {
  studentSatisfaction: number;
  learningOutcomes: number;
  engagementRate: number;
  completionRate: number;
}
