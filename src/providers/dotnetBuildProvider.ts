import { CancellationToken, ProviderResult, ShellExecution, Task, TaskDefinition, TaskProvider, TaskScope, tasks, workspace } from 'vscode';

export const type = 'dotnet-sdk';

export class DotnetTaskProvider implements TaskProvider {

    provideTasks(token: CancellationToken): ProviderResult<Task[]> {
        const definition: DotnetBuildTaskDefinition = testTaskDefinition;
        var problemMatchers = ["$myProblemMatcher"];
        return  [
            new Task (
                {type: type},
                TaskScope.Workspace,
                'build-with-sdk',
                'dotnet-sdk',
                new ShellExecution(getShellCommand(definition)),
                problemMatchers
            )
        ];
    }

    resolveTask(task: Task, token: CancellationToken): ProviderResult<Task> {
        return task;
    }
}

function getShellCommand(definition: DotnetBuildTaskDefinition): string {
    const configuration = definition.configuration ? `-c ${definition.configuration}` : '';
    const publishFlag = definition.isWebApp ? '-p:PublishProfile=DefaultContainer' : '/t:PublishContainer';
    const sdkBuildCommand = `dotnet publish --os ${definition.os} --arch ${definition.arch} ${publishFlag} ${configuration}-p:ContainerImageName=${definition.imageName} -p:ContainerImageTag=${definition.imageTag}`;
    return sdkBuildCommand;
}

interface DotnetBuildTaskDefinition extends TaskDefinition {
    /**
     * Name of image to build
     */
    imageName?: string;

    /**
     * Tag of image to build
     */
    imageTag?: string;

    /**
     * Build configuration
     */
    configuration?: string;

    /**
     * Target os
     */
    os?: string;

    /**
     * Target archtechture
     */
    arch?: string;

    /**
     * Whether to build a web app
     */
    isWebApp?: boolean;
}

export const testTaskDefinition: DotnetBuildTaskDefinition = {
    type: type,
    imageName: 'dotnetTest',
    imageTag: 'latest',
    configuration: 'Debug',
    os: 'linux',
    arch: 'arm64',
    isWebApp: true
};
