import React, { useMemo } from "react";
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, Position, Handle } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Componente para nodo de tabla personalizado
const TableNode = ({ data }) => {
  return (
    <div className="bg-white border-2 border-green-300 rounded-lg shadow-lg min-w-[250px] relative">
      {/* Header de la tabla */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-t-lg">
        <h3 className="font-bold text-sm">{data.tableName}</h3>
        <span className="text-xs opacity-90">{data.columns.length} columnas</span>
      </div>

      {/* Cuerpo de la tabla */}
      <div className="p-0">
        {data.columns.map((column) => {
          const isPrimaryKey = data.primaryKeys?.includes(column.name);
          const isForeignKey = data.foreignKeys?.some((fk) => fk.column === column.name);

          return (
            <div
              key={column.name}
              className={`relative px-3 py-2 text-xs border-b border-gray-100 last:border-b-0 hover:bg-green-50 transition-colors ${isPrimaryKey ? "bg-yellow-50" : ""} ${isForeignKey ? "bg-blue-50" : ""}`}
            >
              {/* Handle de salida para Foreign Keys */}
              {isForeignKey && (
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`${column.name}-source`}
                  style={{
                    background: '#3b82f6',
                    width: 8,
                    height: 8,
                    border: '2px solid white',
                    right: -4
                  }}
                />
              )}
              
              {/* Handle de entrada para Primary Keys */}
              {isPrimaryKey && (
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`${column.name}-target`}
                  style={{
                    background: '#eab308',
                    width: 8,
                    height: 8,
                    border: '2px solid white',
                    left: -4
                  }}
                />
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className={`font-medium ${isPrimaryKey ? "text-yellow-700" : isForeignKey ? "text-blue-700" : "text-gray-800"}`}>{column.name}</span>
                  <div className="flex space-x-1">
                    {isPrimaryKey && <span className="bg-yellow-200 text-yellow-800 px-1 py-0.5 rounded text-xs font-medium">PK</span>}
                    {isForeignKey && <span className="bg-blue-200 text-blue-800 px-1 py-0.5 rounded text-xs font-medium">FK</span>}
                    {column.nullable === "NO" && <span className="bg-red-200 text-red-800 px-1 py-0.5 rounded text-xs font-medium">NOT NULL</span>}
                  </div>
                </div>
                <span className="text-gray-500 text-xs">
                  {column.type}
                  {column.max_length && `(${column.max_length})`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DatabaseSchemaFlow = ({ schemaData }) => {
  // Tipos de nodos personalizados
  const nodeTypes = useMemo(
    () => ({
      tableNode: TableNode,
    }),
    []
  );

  // Generar nodos a partir de los datos del esquema
  const initialNodes = useMemo(() => {
    if (!schemaData || !schemaData.schema) return [];

    const tables = Object.entries(schemaData.schema.tables);
    const nodeSpacingX = 400;
    const nodeSpacingY = 200;
    const nodesPerRow = Math.ceil(Math.sqrt(tables.length)); // Layout más cuadrado

    return tables.map(([tableName, tableInfo], index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;

      // Buscar claves primarias y foráneas para esta tabla
      const primaryKeys = schemaData.schema.primary_keys?.[tableName] || [];
      const foreignKeys = schemaData.schema.relationships?.filter((rel) => rel.table === tableName) || [];

      return {
        id: tableName,
        type: "tableNode",
        position: {
          x: col * nodeSpacingX + (row % 2) * 100, // Offset alternado para mejor distribución
          y: row * nodeSpacingY,
        },
        data: {
          tableName,
          columns: tableInfo.columns,
          primaryKeys,
          foreignKeys,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
  }, [schemaData]);

  // Generar edges a partir de las relaciones
  const initialEdges = useMemo(() => {
    if (!schemaData || !schemaData.schema || !schemaData.schema.relationships) return [];

    return schemaData.schema.relationships.map((rel, index) => ({
      id: `edge-${index}`,
      source: rel.table,
      target: rel.references_table,
      sourceHandle: `${rel.column}-source`,
      targetHandle: `${rel.references_column}-target`,
      type: "smoothstep",
      animated: true,
      style: {
        stroke: "#3b82f6", // Color azul para FK
        strokeWidth: 3,
        strokeDasharray: "5,5",
      },
      markerEnd: {
        type: "arrowclosed",
        color: "#3b82f6",
        width: 20,
        height: 20,
      },
      label: `${rel.column} → ${rel.references_column}`,
      labelStyle: {
        fontSize: "11px",
        fontWeight: "600",
        fill: "#1e40af",
        backgroundColor: "white",
        padding: "2px 6px",
        borderRadius: "4px",
      },
      labelBgStyle: {
        fill: "white",
        fillOpacity: 0.9,
        rx: 4,
        ry: 4,
      },
    }));
  }, [schemaData]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  if (!schemaData || !schemaData.schema) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg border">
        <div className="text-center">
          <p className="text-gray-500">No hay datos de esquema disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full border border-gray-200 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.15,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        <Background 
          color="#f1f5f9" 
          gap={20} 
          size={1} 
          variant="dots" 
        />
        <Controls 
          position="top-left" 
          showZoom={true} 
          showFitView={true} 
          showInteractive={false}
        />
        <MiniMap 
          position="bottom-right" 
          nodeColor={(node) => {
            // Color diferente según el tipo de tabla
            if (node.id.includes('user')) return '#8b5cf6';
            if (node.id.includes('product')) return '#06b6d4';
            if (node.id.includes('order')) return '#f59e0b';
            return '#10b981';
          }}
          maskColor="rgba(0, 0, 0, 0.1)" 
          pannable 
          zoomable 
        />
      </ReactFlow>

      {/* Leyenda */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200 max-w-xs">
        <h4 className="font-semibold text-sm mb-2 text-gray-800">Leyenda</h4>
        <div className="space-y-2 text-xs">
          {/* Tipos de campos */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full border border-white shadow-sm"></div>
              <span className="bg-yellow-200 text-yellow-800 px-1 py-0.5 rounded font-medium">PK</span>
              <span>Clave Primaria</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full border border-white shadow-sm"></div>
              <span className="bg-blue-200 text-blue-800 px-1 py-0.5 rounded font-medium">FK</span>
              <span>Clave Foránea</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-red-200 text-red-800 px-1 py-0.5 rounded font-medium">NOT NULL</span>
              <span>Campo Requerido</span>
            </div>
          </div>
          
          {/* Separador */}
          <hr className="border-gray-200" />
          
          {/* Conexiones */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-4 h-0.5 bg-blue-500" style={{strokeDasharray: "2,2"}}></div>
                <div className="w-0 h-0 border-l-4 border-l-blue-500 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
              </div>
              <span>Relación FK → PK</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Conexiones animadas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSchemaFlow;
