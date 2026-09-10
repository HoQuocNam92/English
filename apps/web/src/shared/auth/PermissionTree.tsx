'use client';

import * as React from 'react';
import { actionLabel, resourceLabel } from './permission-labels';

type Permission = { id: string; code: string; resource?: string; action?: string; name?: string };
type TreeNode = { id: string; label: string; kind: 'root' | 'folder' | 'permission'; permission?: Permission; children: TreeNode[] };

function buildTree(permissions: Permission[]): TreeNode {
  const folders = new Map<string, Permission[]>();
  permissions.forEach((permission) => {
    const [codeResource = 'other'] = permission.code.split(':');
    const resource = permission.resource ?? codeResource;
    folders.set(resource, [...(folders.get(resource) ?? []), permission]);
  });

  return {
    id: 'root', label: 'Tất cả chức năng', kind: 'root', children: [...folders.entries()]
      .sort(([a], [b]) => resourceLabel(a).localeCompare(resourceLabel(b), 'vi'))
      .map(([resource, items]) => ({
        id: `folder:${resource}`, label: resourceLabel(resource), kind: 'folder' as const,
        children: items.sort((a, b) => {
          const actionA = a.action ?? a.code.split(':')[1] ?? '';
          const actionB = b.action ?? b.code.split(':')[1] ?? '';
          return actionLabel(actionA).localeCompare(actionLabel(actionB), 'vi');
        }).map((permission) => ({
          id: permission.id,
          label: actionLabel(permission.action ?? permission.code.split(':')[1] ?? permission.name ?? ''),
          kind: 'permission' as const,
          permission,
          children: [],
        })),
      })),
  };
}

function TreeBranch({ node, depth, selectedIds, busyId, onToggle, renderMeta }: {
  node: TreeNode; depth: number; selectedIds?: Set<string>; busyId?: string | null;
  onToggle?: (permission: Permission) => void; renderMeta?: (permission: Permission) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const isLeaf = node.kind === 'permission';
  const descendants = (current: TreeNode): Permission[] => current.permission ? [current.permission] : current.children.flatMap(descendants);
  const childPermissions = descendants(node);
  const selectedChildren = childPermissions.filter((permission) => selectedIds?.has(permission.id)).length;

  return <div>
    <div className={`group flex min-h-11 items-center gap-2 rounded-xl px-3 transition-colors ${isLeaf ? 'hover:bg-primary/5' : 'bg-surface-container-low/70 font-semibold'}`} style={{ marginLeft: depth * 22 }}>
      {!isLeaf ? <button type="button" onClick={() => setOpen((value) => !value)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white" aria-label={open ? 'Thu gọn' : 'Mở rộng'}><span className="material-symbols-outlined text-[18px] text-on-surface-variant">{open ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}</span></button> : <span className="ml-2 h-4 w-4 rounded-bl-lg border-b border-l border-outline-variant" />}
      <span className={`material-symbols-outlined text-[20px] ${isLeaf ? 'text-primary' : 'text-amber-500'}`}>{isLeaf ? 'task_alt' : open ? 'folder_open' : 'folder'}</span>
      {isLeaf && onToggle && node.permission ? <input type="checkbox" checked={selectedIds?.has(node.permission.id) ?? false} disabled={busyId === node.permission.id} onChange={() => onToggle(node.permission!)} className="h-4 w-4 accent-primary" /> : null}
      <span className={isLeaf ? 'text-sm text-on-surface' : 'text-sm capitalize text-on-surface'}>{node.label}</span>
      {!isLeaf && <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">{selectedIds ? `${selectedChildren}/${childPermissions.length}` : childPermissions.length}</span>}
      {isLeaf && node.permission && renderMeta ? <div className="ml-auto">{renderMeta(node.permission)}</div> : null}
    </div>
    {!isLeaf && open && <div className="relative mt-1 space-y-1 before:absolute before:bottom-2 before:top-0 before:w-px before:bg-outline-variant/70" style={{ ['--tree-line' as string]: `${(depth + 1) * 22 + 16}px` }}>
      <style>{`.permission-tree-line-${depth}::before{left:var(--tree-line)}`}</style>
      <div className={`permission-tree-line-${depth} space-y-1`}>{node.children.map((child) => <TreeBranch key={child.id} node={child} depth={depth + 1} selectedIds={selectedIds} busyId={busyId} onToggle={onToggle} renderMeta={renderMeta} />)}</div>
    </div>}
  </div>;
}

export function PermissionTree({ permissions, selectedIds, busyId, onToggle, renderMeta }: {
  permissions: Permission[]; selectedIds?: Set<string>; busyId?: string | null;
  onToggle?: (permission: Permission) => void; renderMeta?: (permission: Permission) => React.ReactNode;
}) {
  const tree = React.useMemo(() => buildTree(permissions), [permissions]);
  return <div className="rounded-2xl border border-outline-variant bg-white p-3 shadow-sm"><TreeBranch node={tree} depth={0} selectedIds={selectedIds} busyId={busyId} onToggle={onToggle} renderMeta={renderMeta} /></div>;
}
