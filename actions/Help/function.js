function(ellipsis) {
  ellipsis.success("", {
  choices: [
    {
      actionName: 'Agenda',
      label: 'Today',
      allowMultipleSelections: true,
      allowOthers: true
    },
    {
      actionName: 'Reminders',
      label: 'Now',
      allowMultipleSelections: true,
      allowOthers: true
    },
    {
      actionName: 'Setup',
      label: 'Setup',
      allowMultipleSelections: true,
      allowOthers: true
    },
    {
      actionName: 'Deactivate',
      label: 'Stop calendar',
      allowMultipleSelections: true,
      allowOthers: true
    },
  ]
})
}
