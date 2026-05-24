const fs = require('fs');

const hpPath = 'app/dashboard/homepage/page.js';
const settingsPath = 'app/dashboard/settings/page.js';

let hp = fs.readFileSync(hpPath, 'utf8');
const settings = fs.readFileSync(settingsPath, 'utf8');

// 1. Imports
hp = hp.replace(
  'import { \n  Loader2, \n  CheckCircle2, \n  AlertCircle,\n  Image as ImageIcon,\n  Upload,\n  Plus,\n  Trash2,\n  Save,\n  ExternalLink\n} from "lucide-react";',
  `import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  User,
  HelpCircle,
  Sparkles,
  ArrowUp,
  ArrowDown
} from "lucide-react";`
);

// 2. States
const statesToInject = `
  // Settings States
  const [aboutPage, setAboutPage] = useState({
    badge: "", title: "", introText: "", middleText: "", footerText: "", coverImage: "", floatingPill: "", contactTitle: "", contactEmail: ""
  });
  
  const [planPage, setPlanPage] = useState({
    heroBadge: "", heroTitle: "", heroSubtitle: "", faqBadge: "", faqTitle: "", faqs: []
  });
`;
hp = hp.replace('  // Form State', statesToInject + '\n  // Form State');

// 3. Data fetching
const fetchInjection = `
        const [about, plan] = await Promise.all([
          fetchSettings("about_page"),
          fetchSettings("plan_page")
        ]);
        if (about) setAboutPage(about);
        if (plan) setPlanPage({ ...plan, faqs: plan.faqs || [] });
`;
hp = hp.replace('        const keys = Object.keys(formData);', fetchInjection + '\n        const keys = Object.keys(formData);');

// 4. Save logic
const saveInjection = `
      await saveSettings("about_page", aboutPage);
      await saveSettings("plan_page", planPage);
`;
hp = hp.replace('      showToast("success", "Homepage configurations saved successfully!");', saveInjection + '\n      showToast("success", "Homepage configurations saved successfully!");');

// 5. Image Upload for About Page
const imageUploadInjection = `
    if (sectionKey === "about_page") {
      try {
        const url = await uploadImage(file);
        setAboutPage(prev => ({ ...prev, [fieldKey]: url }));
        showToast("success", "Image uploaded successfully!");
      } catch (err) {
        console.warn("Upload failed, using local preview", err);
        const localUrl = URL.createObjectURL(file);
        setAboutPage(prev => ({ ...prev, [fieldKey]: localUrl }));
        showToast("warning", "Storage upload failed. Local preview used.");
      } finally {
        setImageUploading(false);
      }
      return;
    }
`;
hp = hp.replace('    setImageUploading(true);', '    setImageUploading(true);\n' + imageUploadInjection);

// 6. FAQ Helpers
const faqHelpers = `
  const handleFaqChange = (index, field, val) => {
    const updatedFaqs = [...planPage.faqs];
    updatedFaqs[index] = { ...updatedFaqs[index], [field]: val };
    setPlanPage(prev => ({ ...prev, faqs: updatedFaqs }));
  };

  const addFaq = () => {
    setPlanPage(prev => ({
      ...prev,
      faqs: [...prev.faqs, { q: "", a: "" }]
    }));
  };

  const removeFaq = (index) => {
    const updatedFaqs = planPage.faqs.filter((_, idx) => idx !== index);
    setPlanPage(prev => ({ ...prev, faqs: updatedFaqs }));
  };

  const moveFaq = (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === planPage.faqs.length - 1) return;
    
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updatedFaqs = [...planPage.faqs];
    const temp = updatedFaqs[index];
    updatedFaqs[index] = updatedFaqs[targetIdx];
    updatedFaqs[targetIdx] = temp;
    
    setPlanPage(prev => ({ ...prev, faqs: updatedFaqs }));
  };
`;
hp = hp.replace('  const ToggleSwitch = ({ checked, onChange }) => (', faqHelpers + '\n  const ToggleSwitch = ({ checked, onChange }) => (');

// 7. Tabs
const tabsInjection = `
        <button 
          onClick={() => setActiveTab("about_page")}
          className={\`pb-3 text-sm font-bold uppercase tracking-wide transition-colors \${activeTab === "about_page" ? "text-[#c7962d] border-b-2 border-[#c7962d]" : "text-gray-400 hover:text-gray-600"}\`}
        >
          About Page
        </button>
        <button 
          onClick={() => setActiveTab("plan_page")}
          className={\`pb-3 text-sm font-bold uppercase tracking-wide transition-colors \${activeTab === "plan_page" ? "text-[#c7962d] border-b-2 border-[#c7962d]" : "text-gray-400 hover:text-gray-600"}\`}
        >
          Plan & FAQs
        </button>
`;
hp = hp.replace('      {loading ? (', tabsInjection + '      </div>\n\n      {loading ? (').replace('      </div>\n        <button', '        <button');

// 8. Content Blocks
// Extract About block from settings
const aboutMatch = settings.match(/{\/\* ABOUT PAGE TAB \*\/}[\s\S]*?(?={\/\* PLAN PAGE & FAQS TAB \*\/})/);
let aboutBlock = aboutMatch ? aboutMatch[0] : "";
aboutBlock = aboutBlock.replace('handleSave("about_page", aboutPage)', 'handleSaveAll()');

// Extract Plan block from settings
const planMatch = settings.match(/{\/\* PLAN PAGE & FAQS TAB \*\/}[\s\S]*?(?=<\/div>\n        <\/div>\n      \)}[\s\S]*{\/\* Media Selector Modal \*\/})/);
let planBlock = planMatch ? planMatch[0] : "";
planBlock = planBlock.replace('handleSave("plan_page", planPage)', 'handleSaveAll()');

const combinedBlocks = `
          {/* ABOUT PAGE TAB */}
          ${aboutBlock}
          
          {/* PLAN PAGE & FAQS TAB */}
          ${planBlock}
`;
hp = hp.replace('          {activeTab === "general_site_info" && (', combinedBlocks + '\n          {activeTab === "general_site_info" && (');

// 9. Media selector modal update
const mediaTargetUpdate = `
          if (mediaTarget) {
            if (mediaTarget.tab === "about_page") {
              setAboutPage(prev => ({ ...prev, [mediaTarget.field]: url }));
            }
`;
hp = hp.replace('          if (mediaTarget) {', mediaTargetUpdate);

fs.writeFileSync(hpPath, hp);
console.log('Merged successfully!');
