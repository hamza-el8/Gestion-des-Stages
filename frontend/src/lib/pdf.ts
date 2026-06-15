import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { Company, Internship, User } from "./types";
import { formatDate } from "./format";

export interface DocContext {
  internship: Internship;
  student: User;
  company: Company;
  supervisor: User;
  finalGrade?: number;
  centerName?: string;
}

async function makeQR(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: 220 });
}

function header(doc: jsPDF, center: string) {
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 26, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("StageFlow", 14, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(center, 14, 19);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString("fr-FR"), 196, 12, { align: "right" });
}

function footer(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 280, 196, 280);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "Document genere electroniquement via StageFlow - signature electronique valide",
      14,
      286
    );
    doc.text(`Page ${i}/${pages}`, 196, 286, { align: "right" });
  }
}

function section(doc: jsPDF, y: number, title: string): number {
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(14, y, 182, 9, 2, 2, "F");
  doc.setTextColor(49, 46, 129);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(title, 18, y + 6);
  return y + 14;
}

function line(doc: jsPDF, y: number, label: string, value: string): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(label, 16, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(value || "-", 70, y);
  return y + 7;
}

async function qrBlock(doc: jsPDF, y: number, text: string, caption: string) {
  try {
    const qr = await makeQR(text);
    doc.addImage(qr, "PNG", 150, y, 32, 32);
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(caption, 166, y + 36, { align: "center" });
  } catch {
    /* ignore */
  }
}

export async function generateConvention(ctx: DocContext): Promise<void> {
  const { internship, student, company, supervisor } = ctx;
  const center = ctx.centerName ?? "Centre de Formation Professionnelle";
  const doc = new jsPDF();
  header(doc, center);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("CONVENTION DE STAGE", 105, 40, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Ref. SF-CONV-" + internship.id.toUpperCase(), 105, 46, { align: "center" });

  let y = 56;
  y = section(doc, y, "ENTREPRISE D'ACCUEIL");
  y = line(doc, y, "Raison sociale", company.name);
  y = line(doc, y, "Secteur", company.industry);
  y = line(doc, y, "Adresse", company.address);
  y = line(doc, y + 2, "Tuteur entreprise", internship.companyMentor || "-");

  y += 4;
  y = section(doc, y, "STAGIAIRE");
  y = line(doc, y, "Nom & Prenom", student.name);
  y = line(doc, y, "Filiere", student.filiere ?? "-");
  y = line(doc, y, "Telephone", student.phone || "-");

  y += 4;
  y = section(doc, y, "MODALITES DU STAGE");
  y = line(doc, y, "Sujet du stage", internship.topic);
  y = line(doc, y, "Date de debut", formatDate(internship.startDate));
  y = line(doc, y, "Date de fin", formatDate(internship.endDate));
  y = line(doc, y, "Duree hebdo.", `${internship.hoursPerWeek} h/semaine`);
  y = line(doc, y, "Encadrant pedagogique", supervisor.name);

  await qrBlock(doc, y - 6, `STAGEFLOW|CONV|${internship.id}`, "QR de verification");

  y += 36;
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "Les parties reconnaissent avoir pris connaissance de la presente convention et s'engagent",
    14,
    y
  );
  doc.text("a en respecter les termes. Signature electronique apposee ci-dessous.", 14, y + 5);

  y += 18;
  doc.setDrawColor(203, 213, 225);
  doc.line(20, y, 70, y);
  doc.line(120, y, 170, y);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Le Stagiaire", 45, y + 5, { align: "center" });
  doc.text("L'Entreprise", 145, y + 5, { align: "center" });

  footer(doc);
  doc.save(`Convention_${student.name.replace(/\s/g, "_")}.pdf`);
}

export async function generateAttestation(ctx: DocContext): Promise<void> {
  const { internship, student, company, finalGrade } = ctx;
  const center = ctx.centerName ?? "Centre de Formation Professionnelle";
  const doc = new jsPDF();
  header(doc, center);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("ATTESTATION DE STAGE", 105, 46, { align: "center" });

  let y = 66;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(51, 65, 85);
  const body = `Je soussigne(e), representant de ${company.name}, certifie que ${student.name} a effectue un stage au sein de notre etablissement du ${formatDate(internship.startDate)} au ${formatDate(internship.endDate)}, dans le cadre de sa formation en ${student.filiere}.`;
  doc.splitTextToSize(body, 178).forEach((l: string) => {
    doc.text(l, 16, y);
    y += 6.5;
  });

  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`Sujet : ${internship.topic}`, 16, y);
  y += 9;

  if (finalGrade != null) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(`Mention obtenue a l'evaluation finale : ${finalGrade}/20.`, 16, y);
    y += 8;
  }

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.text(
    "Cette attestation est delivree a l'interesse(e) pour servir et valoir ce que de droit.",
    16,
    y
  );

  await qrBlock(doc, y + 6, `STAGEFLOW|ATT|${internship.id}`, "Authenticite verifiable");

  y += 44;
  doc.setDrawColor(203, 213, 225);
  doc.line(120, y, 180, y);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Cachet & signature - " + company.name, 150, y + 5, { align: "center" });

  footer(doc);
  doc.save(`Attestation_${student.name.replace(/\s/g, "_")}.pdf`);
}

export async function generateReportCover(ctx: DocContext, reports: number): Promise<void> {
  const { internship, student, company, supervisor } = ctx;
  const center = ctx.centerName ?? "Centre de Formation Professionnelle";
  const doc = new jsPDF();
  header(doc, center);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("RAPPORT DE STAGE", 105, 46, { align: "center" });

  doc.setFillColor(238, 242, 255);
  doc.roundedRect(30, 58, 150, 90, 4, 4, "F");

  doc.setTextColor(49, 46, 129);
  doc.setFontSize(13);
  doc.text(internship.topic, 105, 76, { align: "center", maxWidth: 130 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Presente par : ${student.name}`, 105, 96, { align: "center" });
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Filiere : ${student.filiere}`, 105, 104, { align: "center" });
  doc.text(`Entreprise : ${company.name}`, 105, 112, { align: "center" });
  doc.text(`Encadrant pedagogique : ${supervisor.name}`, 105, 120, { align: "center" });
  doc.text(
    `Periode : ${formatDate(internship.startDate)} - ${formatDate(internship.endDate)}`,
    105,
    128,
    { align: "center" }
  );
  doc.text(`Rapports hebdomadaires/journaliers : ${reports}`, 105, 136, { align: "center" });

  await qrBlock(doc, 158, `STAGEFLOW|RPT|${internship.id}`, "Page de garde");

  footer(doc);
  doc.save(`Rapport_${student.name.replace(/\s/g, "_")}.pdf`);
}
