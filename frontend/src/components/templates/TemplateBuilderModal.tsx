import React, { useState } from 'react';
import { X, Sparkles, Upload, Palette } from 'lucide-react';
import { api } from '../../api/client';

interface TemplateBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TemplateBuilderModal: React.FC<TemplateBuilderModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [watermark, setWatermark] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1E3A8A');
  const [accentColor, setAccentColor] = useState('#3B82F6');
  const [paperSize, setPaperSize] = useState('A4');
  const [logoFileId, setLogoFileId] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setLogoPreview(URL.createObjectURL(file));
      try {
        const res = await api.uploadLogo(file);
        setLogoFileId(res.logo_file_id);
      } catch (err) {
        console.error('Failed to upload logo:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Please provide a company name.');
      return;
    }
    const tplName = name.trim() || `${companyName} Letterhead`;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.buildTemplate({
        name: tplName,
        company_name: companyName,
        tagline,
        phone,
        email,
        website,
        address,
        tax_id: taxId,
        watermark_text: watermark,
        primary_color: primaryColor,
        accent_color: accentColor,
        paper_size: paperSize,
        orientation: 'portrait',
        margin_top: 105.0,
        margin_bottom: 60.0,
        margin_left: 36.0,
        margin_right: 36.0,
        logo_file_id: logoFileId
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create template');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-900" />
            <h3 className="font-bold text-slate-900 text-base">Design Letterhead</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Template Label */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Template Preset Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Corporate Letterhead"
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
            />
          </div>

          {/* Logo & Company Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company Logo</label>
              <div className="flex items-center space-x-2">
                {logoPreview ? (
                  <div className="w-14 h-14 rounded-lg border border-slate-300 p-1 bg-white overflow-hidden shrink-0">
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                )}
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  onChange={handleLogoUpload}
                  className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-900"
                />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. APEX DYNAMICS INC."
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tagline / Business Line</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Next-Generation Technology & Enterprise Solutions"
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (800) 555-0199"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@company.com"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Website URL</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="www.company.com"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              />
            </div>
          </div>

          {/* Address & Tax/EIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Registered Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Suite 400, 750 Tech Blvd, Austin, TX 78701"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tax / Registration ID</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="EIN: 84-2910482 / VAT ID"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              />
            </div>
          </div>

          {/* Brand Colors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                />
                <span className="font-mono text-xs">{primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Accent Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                />
                <span className="font-mono text-xs">{accentColor}</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Paper Size</label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5"
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Watermark Text</label>
              <input
                type="text"
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                placeholder="e.g. APEX (Optional)"
                className="w-full text-xs border border-slate-300 rounded-lg px-2 py-1.5"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Letterhead...' : 'Build & Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
