export const getXmlTemplate = () => {
  return /* xml */ `
{{{generationHeader}}}

<repository>
  <metadata>
    <files_processed>{{{processedFiles.length}}}</files_processed>
  </metadata>

  <file_summary>
    This section contains a summary of this file.

    <purpose>
      {{{summaryPurpose}}}
    </purpose>

    <file_format>
      {{{summaryFileFormat}}}
      4. Repository files, each consisting of:
        - File path as an attribute
        - Full contents of the file
    </file_format>

    <usage_guidelines>
      {{{summaryUsageGuidelines}}}
    </usage_guidelines>

    <notes>
      {{{summaryNotes}}}
    </notes>

    <additional_info>
      {{#if headerText}}
      <user_provided_header>
        {{{headerText}}}
      </user_provided_header>
      {{/if}}

      {{{summaryAdditionalInfo}}}
    </additional_info>

  </file_summary>

  <repository_structure>
    {{{treeString}}}
  </repository_structure>

  <repository_files>
    This section contains the contents of the repository's files.

    {{#each processedFiles}}
    <file path="{{{this.path}}}">
      {{#if config.output.showLineNumbers}}
      {{#each this.content.split('\n') as |line i|}}
      <line number="{{{i + 1}}}">{{{escapeXml(line)}}}</line>
      {{/each}}
      {{else}}
      {{{escapeXml(this.content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').split('\n').filter(line => line.trim()).join('\n'))}}}
      {{/if}}
    </file>

    {{/each}}
  </repository_files>

  {{#if instruction}}
  <instruction>
    {{{instruction}}}
  </instruction>
  {{/if}}
</repository>
`;
};
