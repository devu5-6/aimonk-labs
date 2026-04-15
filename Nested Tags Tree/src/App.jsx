import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL

const TagView = ({ node, onUpdate, isRoot = false }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(node.name);

  const handleNameSubmit = (e) => {
    if (e.key === 'Enter') {
      onUpdate({ ...node, name: tempName });
      setIsEditingName(false);
    }
  };

  const handleDataChange = (e) => {
    onUpdate({ ...node, data: e.target.value });
  };

  const handleAddChild = () => {
    const newNode = { ...node };

    if (newNode.data !== undefined) {
      delete newNode.data;
      newNode.children = [{ name: "New Child", data: "Data" }];
    } else {
      if (!newNode.children) newNode.children = [];
      newNode.children = [...newNode.children, { name: "New Child", data: "Data" }];
    }

    onUpdate(newNode);
    setCollapsed(false);
  };

  const handleChildUpdate = (index, updatedChild) => {
    const newChildren = [...node.children];
    newChildren[index] = updatedChild;
    onUpdate({ ...node, children: newChildren });
  };

  return (
    <div className={`relative my-2 ${isRoot ? 'ml-0' : 'ml-6'} ${!isRoot && "before:content-[''] before:absolute before:top-0 before:bottom-0 before:-left-4 before:w-0.5 before:bg-slate-200 before:rounded-sm last:before:bottom-auto last:before:h-6"
      }`}>
      <div className="flex items-center bg-white border border-slate-300 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:border-slate-400 hover:shadow-md gap-3 z-10 relative">
        <button
          className="bg-slate-100 text-slate-500 w-6 h-6 rounded-md flex items-center justify-center text-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <svg class="w-3 h-3 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1" />
          </svg> : <svg class="w-3 h-3 text-gray-800 dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1" />
          </svg>}
        </button>

        {isEditingName ? (
          <input
            className="flex-grow border-2 border-blue-500 rounded-md px-2 py-1 text-sm font-medium outline-none bg-blue-50 focus:ring-2 focus:ring-blue-200"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={handleNameSubmit}
            autoFocus
            onBlur={() => setIsEditingName(false)}
          />
        ) : (
          <span
            className="flex-grow font-semibold text-slate-800 cursor-text text-sm"
            onClick={() => setIsEditingName(true)}
          >
            {node.name}
          </span>
        )}

        <button
          className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all hover:bg-blue-100 hover:border-blue-300"
          onClick={handleAddChild}
        >
          + Add Child
        </button>
      </div>

      {!collapsed && (
        <div className="pt-1">
          {node.data !== undefined ? (
            <div className="mt-2 bg-slate-50 border border-dashed border-slate-300 rounded-lg p-2.5 flex items-center gap-3 ml-2">
              <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded tracking-wide">DATA</span>
              <input
                className="flex-grow max-w-xs border border-slate-300 rounded-md px-3 py-1.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                value={node.data}
                onChange={handleDataChange}
              />
            </div>
          ) : node.children ? (
            node.children.map((child, idx) => (
              <TagView
                key={idx}
                node={child}
                onUpdate={(updated) => handleChildUpdate(idx, updated)}
              />
            ))
          ) : null}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [trees, setTrees] = useState([]);
  const [exportedData, setExportedData] = useState({});

  const defaultTreeStructure = {
    name: 'root',
    children: [
      {
        name: 'child1',
        children: [
          { name: 'child1-child1', data: "c1-c1 Hello" },
          { name: 'child1-child2', data: "c1-c2 JS" }
        ]
      },
      { name: 'child2', data: "c2 World" }
    ]
  };

  useEffect(() => {
    fetch(`${API_BASE}/trees`)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          setTrees([{ id: null, tree_data: defaultTreeStructure }]);
        } else {
          setTrees(data);
        }
      })
      .catch(err => console.error("Failed to fetch trees:", err));
  }, []);

  const handleUpdateTree = (index, updatedTreeData) => {
    const newTrees = [...trees];
    newTrees[index].tree_data = updatedTreeData;
    setTrees(newTrees);
  };

  const exportAndSave = async (treeIndex) => {
    const targetTree = trees[treeIndex];
    const exportedJSON = JSON.stringify(targetTree.tree_data, null, 2);

    setExportedData(prev => ({
      ...prev,
      [treeIndex]: exportedJSON
    }));

    try {
      if (targetTree.id) {
        await fetch(`${API_BASE}/trees/${targetTree.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tree_data: targetTree.tree_data })
        });
      } else {
        const res = await fetch(`${API_BASE}/trees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tree_data: targetTree.tree_data })
        });
        const savedData = await res.json();

        const newTrees = [...trees];
        newTrees[treeIndex] = savedData;
        setTrees(newTrees);
      }
    } catch (error) {
      console.error("Error saving to DB:", error);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 font-sans text-slate-800 overflow-hidden">

      <nav className="shrink-0 bg-linear-to-br from-slate-900 to-slate-800 text-white px-8 py-3 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="text-2xl text-sky-400">❖</div>
          <h1 className="text-xl font-semibold tracking-wide m-0">Tree Hierarchy App</h1>
        </div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-sm font-medium border border-white/20">
          Admin Dashboard
        </div>
      </nav>

      <div className="flex-grow flex flex-col max-w-4xl w-full mx-auto p-6 overflow-hidden">
        {trees.map((treeObj, index) => (
          <div key={treeObj.id || `new-${index}`} className="flex flex-col flex-grow bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-full">

            {/* Tree Header */}
            <div className="shrink-0 px-8 py-4 border-b border-slate-400 flex justify-between items-center bg-slate-300">
              <h2 className="text-lg font-semibold text-slate-800 m-0">
                Hierarchy Workspace {trees.length > 1 ? `#${index + 1}` : ''}
              </h2>
            </div>

            <div className="flex-grow p-6 overflow-auto bg-white">
              <TagView
                node={treeObj.tree_data}
                onUpdate={(updatedData) => handleUpdateTree(index, updatedData)}
                isRoot={true}
              />
            </div>

            <div className="shrink-0 px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-col items-end gap-4">
              <button
                className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg"
                onClick={() => exportAndSave(index)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Export & Save to Database
              </button>

              {exportedData[index] && (
                <div className="w-full bg-slate-900 rounded-lg border border-slate-700 p-4 shadow-inner overflow-hidden flex flex-col max-h-48">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Exported Data Structure</span>
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      Saved successfully
                    </span>
                  </div>
                  <pre className="text-sm font-mono text-slate-300 overflow-auto whitespace-pre-wrap flex-grow m-0">
                    {exportedData[index]}
                  </pre>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default App;