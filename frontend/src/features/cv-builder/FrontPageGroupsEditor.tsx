import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SkillDto, CertificationDto } from '../profile/collectionsApi'
import {
  getFrontPageGroups, createFrontPageGroup, updateFrontPageGroup, deleteFrontPageGroup,
  type FrontPageGroupDto, type GroupItemBody,
} from './frontPageGroupsApi'

interface Props {
  cvId: string
  allSkills: SkillDto[]
  allCertifications: CertificationDto[]
}

export function FrontPageGroupsEditor({ cvId, allSkills, allCertifications }: Props) {
  const qc = useQueryClient()
  const dragGroupIdxRef = useRef<number | null>(null)

  const { data: groups = [] } = useQuery({
    queryKey: ['front-page-groups', cvId],
    queryFn: () => getFrontPageGroups(cvId),
  })

  const createMutation = useMutation({
    mutationFn: () => createFrontPageGroup(cvId, { displayOrder: groups.length }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['front-page-groups', cvId] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (groupId: string) => deleteFrontPageGroup(cvId, groupId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['front-page-groups', cvId] }),
  })

  async function handleGroupDrop(targetIdx: number) {
    const fromIdx = dragGroupIdxRef.current
    if (fromIdx === null || fromIdx === targetIdx) return
    dragGroupIdxRef.current = null

    const reordered = [...groups]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(targetIdx, 0, moved)

    await Promise.all(
      reordered
        .map((g, i) => ({ g, i }))
        .filter(({ g, i }) => g.displayOrder !== i)
        .map(({ g, i }) =>
          updateFrontPageGroup(cvId, g.id, {
            headerSv: g.headerSv,
            headerEn: g.headerEn,
            displayOrder: i,
            items: g.items.map(item => ({
              skillId: item.skillId,
              certificationId: item.certificationId,
              displayOrder: item.displayOrder,
            })),
          })
        )
    )
    qc.invalidateQueries({ queryKey: ['front-page-groups', cvId] })
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500">Front Page Groups</h3>
        <button
          type="button"
          onClick={() => createMutation.mutate()}
          className="text-xs text-blue-600 hover:underline"
          aria-label="Add group"
        >
          + Add
        </button>
      </div>
      {groups.length === 0 && <p className="text-xs text-gray-400">No groups</p>}
      {groups.map((group, idx) => (
        <div
          key={group.id}
          draggable
          onDragStart={() => { dragGroupIdxRef.current = idx }}
          onDragOver={e => e.preventDefault()}
          onDrop={() => handleGroupDrop(idx)}
        >
          <GroupEditor
            group={group}
            cvId={cvId}
            allSkills={allSkills}
            allCertifications={allCertifications}
            onDelete={() => deleteMutation.mutate(group.id)}
          />
        </div>
      ))}
    </section>
  )
}

interface GroupEditorProps {
  group: FrontPageGroupDto
  cvId: string
  allSkills: SkillDto[]
  allCertifications: CertificationDto[]
  onDelete: () => void
}

function GroupEditor({ group, cvId, allSkills, allCertifications, onDelete }: GroupEditorProps) {
  const qc = useQueryClient()
  const [headerSv, setHeaderSv] = useState(group.headerSv ?? '')
  const [headerEn, setHeaderEn] = useState(group.headerEn ?? '')
  const [addMode, setAddMode] = useState(false)
  const dragItemIdxRef = useRef<number | null>(null)

  const updateMutation = useMutation({
    mutationFn: (data: { headerSv: string | null; headerEn: string | null; items: GroupItemBody[] }) =>
      updateFrontPageGroup(cvId, group.id, {
        headerSv: data.headerSv,
        headerEn: data.headerEn,
        displayOrder: group.displayOrder,
        items: data.items,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['front-page-groups', cvId] }),
  })

  function saveHeaders(sv: string, en: string) {
    updateMutation.mutate({
      headerSv: sv || null,
      headerEn: en || null,
      items: group.items.map(i => ({
        skillId: i.skillId,
        certificationId: i.certificationId,
        displayOrder: i.displayOrder,
      })),
    })
  }

  function handleAddItem(skillId?: string, certificationId?: string) {
    const newItems: GroupItemBody[] = [
      ...group.items.map(i => ({
        skillId: i.skillId,
        certificationId: i.certificationId,
        displayOrder: i.displayOrder,
      })),
      { skillId: skillId ?? null, certificationId: certificationId ?? null, displayOrder: group.items.length },
    ]
    updateMutation.mutate({ headerSv: headerSv || null, headerEn: headerEn || null, items: newItems })
    setAddMode(false)
  }

  function handleRemoveItem(itemId: string) {
    const newItems: GroupItemBody[] = group.items
      .filter(i => i.id !== itemId)
      .map((i, idx) => ({
        skillId: i.skillId,
        certificationId: i.certificationId,
        displayOrder: idx,
      }))
    updateMutation.mutate({ headerSv: headerSv || null, headerEn: headerEn || null, items: newItems })
  }

  async function handleItemDrop(targetIdx: number) {
    const fromIdx = dragItemIdxRef.current
    if (fromIdx === null || fromIdx === targetIdx) return
    dragItemIdxRef.current = null

    const reordered = [...group.items]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(targetIdx, 0, moved)

    const newItems: GroupItemBody[] = reordered.map((item, i) => ({
      skillId: item.skillId,
      certificationId: item.certificationId,
      displayOrder: i,
    }))
    updateMutation.mutate({ headerSv: headerSv || null, headerEn: headerEn || null, items: newItems })
  }

  return (
    <div className="mb-3 border rounded p-2 bg-white">
      <div className="flex items-start gap-1 mb-1">
        <div className="flex flex-col gap-1 flex-1">
          <input
            type="text"
            placeholder="Header (SV)"
            value={headerSv}
            onChange={e => setHeaderSv(e.target.value)}
            onBlur={() => saveHeaders(headerSv, headerEn)}
            className="text-xs border rounded px-1 py-0.5 w-full"
            aria-label="Group header (SV)"
          />
          <input
            type="text"
            placeholder="Header (EN)"
            value={headerEn}
            onChange={e => setHeaderEn(e.target.value)}
            onBlur={() => saveHeaders(headerSv, headerEn)}
            className="text-xs border rounded px-1 py-0.5 w-full"
            aria-label="Group header (EN)"
          />
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete group"
          className="text-gray-400 hover:text-red-500 text-xs mt-0.5 shrink-0"
        >
          ✕
        </button>
      </div>

      <div>
        {group.items.map((item, idx) => {
          const skill = allSkills.find(s => s.id === item.skillId)
          const cert = allCertifications.find(c => c.id === item.certificationId)
          const label = skill?.name ?? cert?.nameSv ?? cert?.nameEn ?? '?'
          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => { dragItemIdxRef.current = idx }}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleItemDrop(idx)}
              className="flex items-center gap-1 py-0.5 cursor-grab"
            >
              <span className="text-xs text-gray-400 select-none">⠿</span>
              <span className="text-xs flex-1">{label}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                aria-label={`Remove item ${label}`}
                className="text-gray-400 hover:text-red-500 text-xs"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      {addMode ? (
        <select
          aria-label="Select item to add"
          defaultValue=""
          onChange={e => {
            const val = e.target.value
            if (val.startsWith('skill:')) handleAddItem(val.slice(6), undefined)
            else if (val.startsWith('cert:')) handleAddItem(undefined, val.slice(5))
          }}
          className="mt-1 text-xs border rounded px-1 py-0.5 w-full"
        >
          <option value="" disabled>Select skill or certification…</option>
          {allSkills.map(s => (
            <option key={s.id} value={`skill:${s.id}`}>{s.name}</option>
          ))}
          {allCertifications.map(c => (
            <option key={c.id} value={`cert:${c.id}`}>{c.nameSv || c.nameEn || ''}</option>
          ))}
        </select>
      ) : (
        <button
          type="button"
          onClick={() => setAddMode(true)}
          className="mt-1 text-xs text-blue-600 hover:underline"
          aria-label="Add item to group"
        >
          + Add item
        </button>
      )}
    </div>
  )
}
