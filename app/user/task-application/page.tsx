"use client";

import React, { useState } from "react";
import { Plus, X, Edit2, Eye, Code } from "lucide-react";

export default function FormBuilderWizard() {
  const [forms, setForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const [fieldData, setFieldData] = useState({
    type: "text",
    label: "",
    placeholder: "",
    required: false,
    options: "",
  });

  const fieldTypes = [
    { value: "text", label: "Text Input" },
    { value: "email", label: "Email" },
    { value: "number", label: "Number" },
    { value: "textarea", label: "Text Area" },
    { value: "select", label: "Dropdown" },
    { value: "radio", label: "Radio Buttons" },
    { value: "checkbox", label: "Checkbox" },
  ];

  const startNewForm = () => {
    const newForm = {
      id: Date.now().toString(),
      title: "Untitled Form",
      fields: [],
    };
    setCurrentForm(newForm);
  };

  const addField = () => {
    setFieldData({
      type: "text",
      label: "",
      placeholder: "",
      required: false,
      options: "",
    });
    setShowModal(true);
  };

  const saveField = () => {
    if (!fieldData.label.trim()) {
      alert("Please enter a field label");
      return;
    }

    const newField = {
      id: Date.now().toString(),
      type: fieldData.type,
      label: fieldData.label,
      placeholder: fieldData.placeholder,
      required: fieldData.required,
      options: ["select", "radio"].includes(fieldData.type)
        ? fieldData.options
            .split(",")
            .map((o) => o.trim())
            .filter((o) => o)
        : [],
    };

    setCurrentForm({
      ...currentForm,
      fields: [...currentForm.fields, newField],
    });

    setShowModal(false);
  };

  const removeField = (fieldId) => {
    setCurrentForm({
      ...currentForm,
      fields: currentForm.fields.filter((f) => f.id !== fieldId),
    });
  };

  const saveForm = () => {
    if (!currentForm.title.trim()) {
      alert("Please enter a form title");
      return;
    }
    if (currentForm.fields.length === 0) {
      alert("Please add at least one field");
      return;
    }

    const existingIndex = forms.findIndex((f) => f.id === currentForm.id);
    if (existingIndex >= 0) {
      const updatedForms = [...forms];
      updatedForms[existingIndex] = currentForm;
      setForms(updatedForms);
    } else {
      setForms([...forms, currentForm]);
    }

    setCurrentForm(null);
    alert("Form saved successfully!");
  };

  const renderFieldPreview = (field) => {
    const baseClasses =
      "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            className={baseClasses}
            placeholder={field.placeholder}
            rows="3"
          />
        );
      case "select":
        return (
          <select className={baseClasses}>
            <option value="">Select an option</option>
            {field.options.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {field.options.map((opt, i) => (
              <label key={i} className="flex items-center gap-2">
                <input type="radio" name={field.id} value={opt} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span>{field.label}</span>
          </label>
        );
      default:
        return (
          <input
            type={field.type}
            className={baseClasses}
            placeholder={field.placeholder}
          />
        );
    }
  };

  if (!currentForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Form Builder
            </h1>
            <p className="text-gray-600">
              Create custom forms with a simple wizard
            </p>
          </div>

          <button
            onClick={startNewForm}
            className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-lg font-semibold mb-8"
          >
            <Plus size={24} />
            Create New Form
          </button>

          {forms.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Your Forms
              </h2>
              {forms.map((form) => (
                <div key={form.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {form.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {form.fields.length} fields
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentForm(form)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Title
            </label>
            <input
              type="text"
              value={currentForm.title}
              onChange={(e) =>
                setCurrentForm({ ...currentForm, title: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter form title"
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Form Fields
              </h3>
              <button
                onClick={addField}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus size={18} />
                Add Field
              </button>
            </div>

            {currentForm.fields.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600">
                  No fields yet. Click "Add Field" to start building your form.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentForm.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          #{index + 1}
                        </span>
                        <h4 className="font-semibold text-gray-800">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {
                            fieldTypes.find((t) => t.value === field.type)
                              ?.label
                          }
                        </p>
                      </div>
                      <button
                        onClick={() => removeField(field.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveForm}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Save Form
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="px-6 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            >
              <Eye size={18} />
              Preview
            </button>
            <button
              onClick={() => setShowJson(true)}
              className="px-6 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <Code size={18} />
              JSON
            </button>
            <button
              onClick={() => setCurrentForm(null)}
              className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Add New Field</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type
                </label>
                <select
                  value={fieldData.type}
                  onChange={(e) =>
                    setFieldData({ ...fieldData, type: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {fieldTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label *
                </label>
                <input
                  type="text"
                  value={fieldData.label}
                  onChange={(e) =>
                    setFieldData({ ...fieldData, label: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., Full Name"
                />
              </div>

              {!["checkbox", "radio", "select"].includes(fieldData.type) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={fieldData.placeholder}
                    onChange={(e) =>
                      setFieldData({
                        ...fieldData,
                        placeholder: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="e.g., Enter your name"
                  />
                </div>
              )}

              {["select", "radio"].includes(fieldData.type) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={fieldData.options}
                    onChange={(e) =>
                      setFieldData({ ...fieldData, options: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="e.g., Option 1, Option 2, Option 3"
                  />
                </div>
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={fieldData.required}
                  onChange={(e) =>
                    setFieldData({ ...fieldData, required: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">
                  Required field
                </span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveField}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                Add Field
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold">{currentForm.title}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {currentForm.fields.map((field) => (
                <div key={field.id}>
                  {field.type !== "checkbox" && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                  )}
                  {renderFieldPreview(field)}
                </div>
              ))}
            </div>

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition mt-6">
              Submit
            </button>
          </div>
        </div>
      )}

      {showJson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Form JSON</h3>
              <button
                onClick={() => setShowJson(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(currentForm, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
