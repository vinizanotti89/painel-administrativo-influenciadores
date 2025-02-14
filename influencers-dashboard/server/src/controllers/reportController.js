import { ReportService } from '../services/reportService.js';

export class ReportController {
  static async generateReport(req, res) {
    try {
      const { type, filters } = req.body;
      const report = await ReportService.generate(type, filters);
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getReportById(req, res) {
    try {
      const { id } = req.params;
      const report = await ReportService.getById(id);
      
      if (!report) {
        return res.status(404).json({ message: 'Relatório não encontrado' });
      }
      
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getReports(req, res) {
    try {
      const filters = req.query;
      const reports = await ReportService.getAll(filters);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async exportReport(req, res) {
    try {
      const { id, format } = req.params;
      const exportedReport = await ReportService.export(id, format);
      
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename=report.${format}`);
      res.send(exportedReport);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}