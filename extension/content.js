// Content Script executing inside active webpage tab (Google Forms, LinkedIn, Custom Job Forms)

console.log('[CareerOS] Content script initialized on page:', window.location.href);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'EXTRACT_DOM_TEXT') {
    const pageText = document.body.innerText || '';
    const pageUrl = window.location.href;
    console.log('[CareerOS] Extracted DOM page text length:', pageText.length);
    sendResponse({ pageText, pageUrl });
  }

  if (request.type === 'SCAN_FORM_FIELDS') {
    console.log('[CareerOS] Form scan requested.');
    const fields = detectFormFields();
    console.log('[CareerOS] Detected form fields count:', fields.length);
    console.dir(fields);
    sendResponse({ fields, pageText: document.body.innerText || '' });
  }

  if (request.type === 'INJECT_AUTOFILL_VALUES') {
    console.log('[CareerOS] Injecting user-approved autofill fields count:', request.approvedFields?.length || 0);
    const verificationReport = injectApprovedValues(request.approvedFields || []);
    console.log('[CareerOS] Injection verification report:', verificationReport);
    sendResponse({ report: verificationReport });
  }
});

/**
 * Universal Form Field Detector
 * Supports Standard HTML Inputs, React/Vue/Angular dynamic forms, and Google Forms ARIA structure.
 */
function detectFormFields() {
  console.log('[CareerOS] Beginning form field detection...');
  const detected = [];
  const processedContainers = new Set();

  // 1. Scan Standard Inputs, Textareas, Selects & Contenteditables
  const elements = document.querySelectorAll(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select, [contenteditable="true"]'
  );

  elements.forEach((el, index) => {
    // Skip invisible/disabled search bars
    if (el.offsetWidth === 0 && el.offsetHeight === 0 && !el.isContentEditable) return;

    let labelText = extractQuestionLabel(el);
    const fieldType = determineFieldType(el);
    const fieldId = el.id || `field_${index}`;

    // Tag element with dataset for instant target lookup during injection
    el.dataset.careerosId = fieldId;

    let options = [];
    if (tagLower(el) === 'select') {
      options = Array.from(el.options).map((o) => o.text.trim()).filter(Boolean);
    }

    detected.push({
      id: fieldId,
      name: el.name || el.id || `input_${index}`,
      label: cleanLabelText(labelText) || el.placeholder || el.name || 'Question',
      type: fieldType,
      options: options,
    });

    console.log(`[CareerOS] Field #${index + 1}: label="${labelText}", type="${fieldType}", id="${fieldId}"`);
  });

  // 2. Scan Google Forms ARIA Radio Groups & Radio Choice Containers
  const radioGroups = document.querySelectorAll('[role="radiogroup"], div.ge5P2e, div.Qr1Oae');
  radioGroups.forEach((group, groupIdx) => {
    const radioItems = group.querySelectorAll('[role="radio"], input[type="radio"]');
    if (radioItems.length === 0) return;

    const groupContainer = group.closest('[role="listitem"], .ge5P2e, .Qr1Oae') || group;
    if (processedContainers.has(groupContainer)) return;
    processedContainers.add(groupContainer);

    const questionText = extractContainerHeading(groupContainer);
    const options = [];

    radioItems.forEach((r) => {
      let optLabel = r.getAttribute('aria-label') || r.innerText;
      if (!optLabel && r.closest('label')) optLabel = r.closest('label').innerText;
      if (!optLabel && r.nextElementSibling) optLabel = r.nextElementSibling.innerText;
      if (!optLabel && r.parentElement) optLabel = r.parentElement.innerText;

      if (optLabel) options.push(cleanLabelText(optLabel));
    });

    const groupFieldId = `radiogroup_${groupIdx}`;
    groupContainer.dataset.careerosId = groupFieldId;

    detected.push({
      id: groupFieldId,
      name: `radiogroup_${groupIdx}`,
      label: cleanLabelText(questionText) || 'Multiple Choice Question',
      type: 'radio_group',
      options: options,
    });

    console.log(`[CareerOS] ARIA Radio Group #${groupIdx + 1}: label="${questionText}", options=`, options);
  });

  // 3. Scan Google Forms ARIA Dropdown Listboxes (`div[role="listbox"]`)
  const listboxes = document.querySelectorAll('[role="listbox"]');
  listboxes.forEach((lb, lbIdx) => {
    const lbContainer = lb.closest('[role="listitem"], .ge5P2e, .Qr1Oae') || lb;
    if (processedContainers.has(lbContainer)) return;
    processedContainers.add(lbContainer);

    const questionText = extractContainerHeading(lbContainer);
    const lbFieldId = `listbox_${lbIdx}`;
    lbContainer.dataset.careerosId = lbFieldId;
    lb.dataset.careerosId = lbFieldId;

    detected.push({
      id: lbFieldId,
      name: `listbox_${lbIdx}`,
      label: cleanLabelText(questionText) || 'Dropdown Question',
      type: 'dropdown',
      options: ['Option Choice'],
    });

    console.log(`[CareerOS] ARIA Dropdown #${lbIdx + 1}: label="${questionText}"`);
  });

  // 4. Scan Google Forms File Upload Container
  const fileButtons = document.querySelectorAll('[role="button"], input[type="file"]');
  fileButtons.forEach((fb, fbIdx) => {
    const fbText = (fb.innerText || fb.ariaLabel || '').toLowerCase();
    if (fbText.includes('add file') || fbText.includes('upload') || fb.type === 'file') {
      const fbContainer = fb.closest('[role="listitem"], .ge5P2e, .Qr1Oae') || fb;
      if (processedContainers.has(fbContainer)) return;
      processedContainers.add(fbContainer);

      const questionText = extractContainerHeading(fbContainer);
      const fbFieldId = `fileupload_${fbIdx}`;
      fbContainer.dataset.careerosId = fbFieldId;

      detected.push({
        id: fbFieldId,
        name: `fileupload_${fbIdx}`,
        label: cleanLabelText(questionText) || 'Upload Resume',
        type: 'file',
        options: [],
      });

      console.log(`[CareerOS] File Upload Container #${fbIdx + 1}: label="${questionText}"`);
    }
  });

  return detected;
}

/**
 * Extracts question label text for a given form element using fallback strategies.
 */
function extractQuestionLabel(el) {
  let labelText = '';

  // Strategy A: Explicit <label for="id">
  if (el.id) {
    const labelEl = document.querySelector(`label[for="${el.id}"]`);
    if (labelEl && labelEl.innerText.trim()) {
      return labelEl.innerText.trim();
    }
  }

  // Strategy B: Nested inside <label>
  if (el.closest('label')) {
    labelText = el.closest('label').innerText.trim();
    if (labelText) return labelText;
  }

  // Strategy C: Google Forms & Dynamic Form Question Container
  const container = el.closest(
    '[role="listitem"], .ge5P2e, .Qr1Oae, .form-group, .field, .form-field, fieldset, form > div, div[jsmodel]'
  );
  if (container) {
    const headingText = extractContainerHeading(container);
    if (headingText) return headingText;
  }

  // Strategy D: ARIA Attributes
  if (el.getAttribute('aria-label')) {
    return el.getAttribute('aria-label').trim();
  }

  if (el.getAttribute('aria-labelledby')) {
    const labelledIds = el.getAttribute('aria-labelledby').split(' ');
    const labels = labelledIds
      .map((id) => document.getElementById(id)?.innerText || '')
      .filter(Boolean);
    if (labels.length > 0) return labels.join(' ').trim();
  }

  // Strategy E: Placeholder or Name attribute
  return el.placeholder || el.name || '';
}

/**
 * Extracts heading/question title from a parent question container.
 */
function extractContainerHeading(container) {
  const titleEl = container.querySelector(
    '[role="heading"], .M7eMe, .ho228, .title, .question-title, label, legend, h1, h2, h3, h4, h5, h6, [aria-level], .exportLabel'
  );
  if (titleEl && titleEl.innerText.trim()) {
    return titleEl.innerText.trim();
  }
  return '';
}

function cleanLabelText(text) {
  if (!text) return '';
  let cleaned = text.replace(/[\*\:\_]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleaned.toLowerCase() === 'your answer' || cleaned.toLowerCase() === 'required') {
    return '';
  }
  return cleaned;
}

function determineFieldType(el) {
  const tag = tagLower(el);
  if (tag === 'textarea' || el.isContentEditable) return 'textarea';
  if (tag === 'select') return 'dropdown';
  if (el.type === 'file') return 'file';
  if (el.type === 'radio') return 'radio_group';
  if (el.type === 'checkbox') return 'checkbox';
  return el.type || 'text';
}

function tagLower(el) {
  return (el.tagName || '').toLowerCase();
}

/**
 * Universal Form Value Injector & Verification Tracker
 * Injects ONLY user-approved field values and returns detailed execution report.
 */
function injectApprovedValues(approvedFields) {
  console.log('[CareerOS] Beginning injection of user-approved fields...');
  let successFilled = 0;
  let manualRequired = 0;
  let failedCount = 0;

  approvedFields.forEach((field) => {
    if (!field.proposed_value && !field.is_resume_upload) {
      console.warn('[CareerOS] Field approved but value is empty:', field.label);
      return;
    }

    console.log(`[CareerOS] Injecting approved field: label="${field.label}", value="${field.proposed_value}"`);

    // Handle File Upload Fields (Browser Sandbox Restriction Handling)
    if (field.type === 'file' || field.is_resume_upload) {
      console.log('[CareerOS] Resume File Upload field detected. Triggering file upload prompt...');
      const targetEl = document.querySelector(`[data-careeros-id="${field.field_id}"]`) || document.querySelector('input[type="file"]');
      if (targetEl) {
        targetEl.focus();
        const buttonEl = targetEl.querySelector('[role="button"]') || targetEl;
        buttonEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      manualRequired++;
      return;
    }

    // Locate Target Element
    let targetEl = null;
    if (field.field_id) {
      targetEl = document.querySelector(`[data-careeros-id="${field.field_id}"]`);
      if (!targetEl) targetEl = document.getElementById(field.field_id);
    }
    if (!targetEl && field.name) {
      targetEl = document.querySelector(`[name="${field.name}"]`);
    }

    // A. Handle Google Forms ARIA Radio Groups
    if (field.type === 'radio_group' || (field.field_id && field.field_id.startsWith('radiogroup_'))) {
      const groupContainer = targetEl || document.querySelector(`[data-careeros-id="${field.field_id}"]`);
      let radioFilled = false;
      if (groupContainer) {
        const radioOptions = groupContainer.querySelectorAll('[role="radio"], input[type="radio"]');
        radioOptions.forEach((r) => {
          let optText = r.getAttribute('aria-label') || r.innerText || r.parentElement?.innerText || '';
          if (
            optText.toLowerCase().includes(field.proposed_value.toLowerCase()) ||
            field.proposed_value.toLowerCase().includes(optText.toLowerCase())
          ) {
            console.log(`[CareerOS] Clicking radio choice option: "${optText}"`);
            r.click();
            r.dispatchEvent(new Event('change', { bubbles: true }));
            radioFilled = true;
          }
        });
      }
      if (radioFilled) successFilled++;
      else failedCount++;
      return;
    }

    // B. Handle Dropdowns / Selects
    if (field.type === 'dropdown' || (field.field_id && field.field_id.startsWith('listbox_'))) {
      if (targetEl && tagLower(targetEl) === 'select') {
        targetEl.value = field.proposed_value;
        targetEl.dispatchEvent(new Event('change', { bubbles: true }));
        successFilled++;
        return;
      }

      // Google Forms ARIA Dropdown listbox
      const lbContainer = targetEl || document.querySelector(`[data-careeros-id="${field.field_id}"]`);
      if (lbContainer) {
        const listbox = lbContainer.querySelector('[role="listbox"]') || lbContainer;
        console.log('[CareerOS] Opening ARIA dropdown listbox...');
        listbox.click();

        setTimeout(() => {
          const options = document.querySelectorAll('[role="option"]');
          let optFound = false;
          options.forEach((opt) => {
            if (opt.innerText.toLowerCase().includes(field.proposed_value.toLowerCase())) {
              opt.click();
              optFound = true;
            }
          });
          if (optFound) successFilled++;
        }, 150);
        return;
      }
    }

    // C. Inject Value into Text / Textarea Input
    if (targetEl) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;

      if (tagLower(targetEl) === 'textarea' && nativeTextAreaValueSetter) {
        nativeTextAreaValueSetter.call(targetEl, field.proposed_value);
      } else if (nativeInputValueSetter && tagLower(targetEl) === 'input') {
        nativeInputValueSetter.call(targetEl, field.proposed_value);
      } else if (targetEl.isContentEditable) {
        targetEl.innerText = field.proposed_value;
      } else {
        targetEl.value = field.proposed_value;
      }

      // Dispatch synthetic DOM events
      targetEl.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      targetEl.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      targetEl.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));

      console.log(`[CareerOS] Injected value into element:`, targetEl);
      successFilled++;
    } else {
      console.warn(`[CareerOS] Target element not found for field:`, field.label);
      failedCount++;
    }
  });

  return {
    successFilled: successFilled,
    manualRequired: manualRequired,
    failedCount: failedCount,
  };
}
