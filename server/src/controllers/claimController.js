import { ClaimService } from '../services/claimService.js';

export class ClaimController {
  static async getClaims(req, res) {
    try {
      const filters = req.query;
      const claims = await ClaimService.getAll(filters);
      res.json(claims);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getClaimById(req, res) {
    try {
      const { id } = req.params;
      const claim = await ClaimService.getById(id);
      
      if (!claim) {
        return res.status(404).json({ message: 'Alegação não encontrada' });
      }
      
      res.json(claim);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createClaim(req, res) {
    try {
      const claimData = req.body;
      const newClaim = await ClaimService.create(claimData);
      res.status(201).json(newClaim);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateClaim(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedClaim = await ClaimService.update(id, updateData);
      
      if (!updatedClaim) {
        return res.status(404).json({ message: 'Alegação não encontrada' });
      }
      
      res.json(updatedClaim);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteClaim(req, res) {
    try {
      const { id } = req.params;
      await ClaimService.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}