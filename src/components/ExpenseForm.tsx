import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Sparkles, Loader2 } from 'lucide-react';
// Corrected import to use AppCategory and Transaction as Category is not exported from types.ts
import { AppCategory, Transaction } from '../types';
import { getSmartCategorization } from '../services/geminiService';
import { localDB } from '../db';

interface ExpenseFormProps {
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSave, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  // Fix: Categories are managed as AppCategory objects, so we fetch them and track selected ID
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);

  // Initialize categories from local storage
  useEffect(() => {
    const cats = localDB.getCategories();
    setCategories(cats);
    if (cats.length > 0) setSelectedCatId(cats[0].id);
  }, []);

  // Auto-categorize based on note using Gemini
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (note.length > 3) {
        setIsClassifying(true);
        const suggested = await getSmartCategorization(note);
        // Fix: Find a matching category by name from the dynamic category list
        const match = categories.find(c => c.name.toLowerCase() === suggested.toLowerCase());
        if (match) setSelectedCatId(match.id);
        setIsClassifying(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [note, categories]);

  const handleSave = () => {
    if (!amount || isNaN(Number(amount))) return;
    
    // Fix: Correct property names to match Transaction interface (categoryId instead of category)
    // Also added required type and paymentMode properties
    onSave({
      id: crypto.randomUUID(),
      amount: Number(amount),
      categoryId: selectedCatId,
      note,
      timestamp: Date.now(),
      type: 'EXPENSE',
      paymentMode: 'CASH'
    });
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col safe-top animate-in slide-in-from-bottom duration-300">
      <header className="p-4 flex items-center justify-between">
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h1 className="text-lg font-bold text-slate-800">New Expense</h1>
        <button 
          onClick={handleSave}
          disabled={!amount}
          className="bg-indigo-600 text-white p-2 rounded-xl disabled:opacity-50 transition-all active:scale-95"
        >
          <Check size={24} />
        </button>
      </header>

      <main className="flex-1 p-6 space-y-8 overflow-y-auto">
        <div className="text-center">
          <label className="block text-sm font-medium text-slate-400 uppercase tracking-widest mb-2">Amount</label>
          <div className="relative inline-block">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-300">$</span>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-6xl font-bold text-indigo-600 bg-transparent border-none outline-none w-full text-center pl-8 focus:ring-0"
              autoFocus
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">Note</label>
            <div className="relative">
              <input 
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What was this for?"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 pr-12 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isClassifying ? (
                  <Loader2 size={20} className="text-indigo-400 animate-spin" />
                ) : (
                  <Sparkles size={20} className="text-indigo-400" />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-3">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {/* Fix: Map over dynamic categories instead of non-existent Category enum */}
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`py-3 px-2 rounded-2xl text-[10px] font-semibold transition-all ${
                    selectedCatId === cat.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
